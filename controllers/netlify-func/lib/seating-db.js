// ==================================
// SEATING DATABASE HELPERS
// File: controllers/netlify-func/lib/seating-db.js
//
// Shared helpers for the seating Netlify functions:
//  - getDb()                : Lazy @netlify/database client
//  - normalizeName()        : Lookup-safe normalization (used on every write)
//  - requireAdminAuth()     : Base64-aware X-Admin-Secret check (matches get-rsvps.js)
//  - isSeatingEnabled()     : SEATING_ENABLED env flag (defaults true)
//  - getSeatingChart()      : Read tables + guests for admin UI
//  - saveSeatingAssignments(): Transactional bulk UPDATE with capacity validation
//  - importGuestNames()     : Idempotent bulk INSERT ... ON CONFLICT DO NOTHING
//  - applySeedAssignments() : Idempotent UPSERT of pre-placed assignments
//  - lookupGuest()          : Exact or fuzzy guest lookup with ambiguity flow
//
// All SQL is parameterized through `db.sql\`...\`` tagged templates or
// `client.query(text, params)` inside a pg pool transaction — no string
// concatenation, no `db.sql.unsafe` paths with user input.
// ==================================

const { getDatabase } = require('@netlify/database');
const {
  TABLE_CAPACITY,
  PRESTATAIRES_TABLE_ID
} = require('../../../models/seating');

/**
 * Normalize a guest name for lookup: trim, lowercase, NFD strip diacritics,
 * collapse internal whitespace. Recomputed on every write so the column always
 * matches what `lookup-seat` will query against.
 *
 * @param {string} name
 * @returns {string}
 */
function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Return the @netlify/database connection. Throws `MissingDatabaseConnectionError`
 * if `NETLIFY_DB_URL` is not provisioned for the current environment.
 * @returns {ReturnType<typeof getDatabase>}
 */
function getDb() {
  return getDatabase();
}

/**
 * Coerce a `db.sql` result into a plain row array. With @netlify/database the
 * tagged template already resolves to `T[]`, but the raw `pg.Pool` path returns
 * `{ rows }` — this helper accepts both so the lib stays compatible with both
 * code paths and any future driver swap.
 * @param {unknown} result
 */
function rowsOf(result) {
  if (Array.isArray(result)) return result;
  if (result && typeof result === 'object' && Array.isArray(result.rows)) {
    return result.rows;
  }
  return [];
}

/**
 * Decode the `X-Admin-Secret` header. Matches the get-rsvps.js heuristic:
 * try base64 first (so non-ASCII passwords survive transport), fall back to
 * the raw value. Returns `undefined` if no header was supplied.
 * @param {string|undefined} headerValue
 * @returns {string|undefined}
 */
function decodeAdminSecret(headerValue) {
  if (!headerValue) return undefined;
  try {
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(headerValue) && headerValue.length > 10;
    if (isBase64) {
      return Buffer.from(headerValue, 'base64').toString('utf-8');
    }
  } catch (_e) {
    /* fall through and return raw value */
  }
  return headerValue;
}

/**
 * Lookup `X-Admin-Secret` from event headers in a case-insensitive way.
 * Netlify normalizes header keys to lowercase but we defensively check both.
 * @param {Record<string, string|undefined>} headers
 */
function readAdminHeader(headers) {
  if (!headers) return undefined;
  return (
    headers['x-admin-secret'] ||
    headers['X-Admin-Secret'] ||
    headers['X-ADMIN-SECRET']
  );
}

/**
 * Enforce admin auth on a Netlify Functions event. Mirrors the
 * `get-rsvps.js` / `delete-rsvp.js` behaviour: 500 if ADMIN_SECRET is not
 * configured server-side, 401 on missing/mismatched header.
 *
 * @param {import('@netlify/functions').HandlerEvent} event
 * @param {string} [requestId] Optional request id for log correlation.
 * @returns {{ ok: true } | { ok: false, statusCode: number, body: string }}
 */
function requireAdminAuth(event, requestId) {
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET) {
    console.error(`[${requestId || 'no-req-id'}] ❌ ADMIN_SECRET not configured`);
    return {
      ok: false,
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const rawHeader = readAdminHeader(event.headers);
  const secret = decodeAdminSecret(rawHeader);
  if (secret !== ADMIN_SECRET) {
    console.warn(
      `[${requestId || 'no-req-id'}] ⚠️ Unauthorized seating admin access ` +
        `(header_present=${Boolean(rawHeader)})`
    );
    return {
      ok: false,
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized - invalid admin secret' })
    };
  }

  return { ok: true };
}

/**
 * Generate a per-request id matching the RSVP function style.
 * @returns {string}
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Read the full chart for the admin UI. Never call this from a public endpoint.
 * @returns {Promise<{ tables: Array<{id:string,label:string,capacity:number|null,sortOrder:number}>, guests: Array<{id:number,displayName:string,tableId:string|null}> }>}
 */
async function getSeatingChart() {
  const db = getDb();

  const tablesResult = await db.sql`
    SELECT id, label, capacity, sort_order
    FROM seating_tables
    ORDER BY sort_order ASC
  `;

  const guestsResult = await db.sql`
    SELECT id, display_name, table_id
    FROM seating_guests
    ORDER BY display_name ASC
  `;

  const tables = rowsOf(tablesResult).map((row) => ({
    id: row.id,
    label: row.label,
    capacity: row.capacity,
    sortOrder: row.sort_order
  }));

  const guests = rowsOf(guestsResult).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    tableId: row.table_id
  }));

  return { tables, guests };
}

/**
 * Transactionally apply table assignments. Algorithm:
 *  1. Open a pg pool client and BEGIN.
 *  2. Re-read tables + guests inside the transaction so capacity checks see
 *     the same snapshot we'll write against.
 *  3. Simulate the resulting per-table counts; reject if any non-Prestataires
 *     table exceeds TABLE_CAPACITY.
 *  4. UPDATE each guest's table_id with a parameterized query.
 *  5. COMMIT — on any error, ROLLBACK and release the client.
 *
 * @param {Array<{ id: number, tableId: string|null }>} assignments
 * @returns {Promise<{ ok: true, updated: number } | { ok: false, error: string, overCapacity?: object[] }>}
 */
async function saveSeatingAssignments(assignments) {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return { ok: false, error: 'No assignments provided' };
  }

  for (const item of assignments) {
    if (typeof item !== 'object' || item === null) {
      return { ok: false, error: 'Each assignment must be an object' };
    }
    if (!Number.isInteger(item.id)) {
      return { ok: false, error: 'assignment.id must be an integer' };
    }
    if (
      item.tableId !== null &&
      item.tableId !== undefined &&
      item.tableId !== '' &&
      typeof item.tableId !== 'string'
    ) {
      return { ok: false, error: 'assignment.tableId must be a string or null' };
    }
  }

  const db = getDb();
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const tablesRes = await client.query(
      'SELECT id, label, capacity FROM seating_tables'
    );
    const tablesById = new Map();
    for (const row of tablesRes.rows) {
      tablesById.set(row.id, row);
    }

    const guestsRes = await client.query(
      'SELECT id, table_id FROM seating_guests'
    );
    const guestMap = new Map();
    for (const row of guestsRes.rows) {
      guestMap.set(row.id, { id: row.id, tableId: row.table_id });
    }

    for (const item of assignments) {
      if (!guestMap.has(item.id)) {
        await client.query('ROLLBACK');
        return { ok: false, error: `Guest id ${item.id} not found` };
      }
      const tableId = item.tableId === '' || item.tableId === undefined ? null : item.tableId;
      if (tableId !== null && !tablesById.has(tableId)) {
        await client.query('ROLLBACK');
        return { ok: false, error: `Unknown table id ${tableId}` };
      }
      guestMap.get(item.id).tableId = tableId;
    }

    const counts = {};
    for (const guest of guestMap.values()) {
      if (!guest.tableId) continue;
      counts[guest.tableId] = (counts[guest.tableId] || 0) + 1;
    }

    const overCapacity = [];
    for (const [tableId, count] of Object.entries(counts)) {
      if (tableId === PRESTATAIRES_TABLE_ID) continue;
      const table = tablesById.get(tableId);
      const capacity = table && table.capacity != null ? table.capacity : TABLE_CAPACITY;
      if (count > capacity) {
        overCapacity.push({
          tableId,
          label: table ? table.label : tableId,
          count,
          capacity
        });
      }
    }

    if (overCapacity.length > 0) {
      await client.query('ROLLBACK');
      return {
        ok: false,
        error: 'One or more tables exceed capacity',
        overCapacity
      };
    }

    let updated = 0;
    for (const item of assignments) {
      const tableId = item.tableId === '' || item.tableId === undefined ? null : item.tableId;
      const res = await client.query(
        'UPDATE seating_guests SET table_id = $1 WHERE id = $2',
        [tableId, item.id]
      );
      updated += res.rowCount || 0;
    }

    await client.query('COMMIT');
    return { ok: true, updated };
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_e) {
      /* ignore rollback errors */
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Idempotent bulk insert of guest names. Uses `db.sql.values()` for a single
 * `INSERT ... VALUES (...)` round-trip with ON CONFLICT (display_name) DO NOTHING.
 * `name_normalized` is recomputed via normalizeName() so renames / re-imports
 * always refresh the lookup column.
 *
 * @param {string[]} displayNames
 * @returns {Promise<{ inserted: number, skipped: number, total: number }>}
 */
async function importGuestNames(displayNames) {
  if (!Array.isArray(displayNames) || displayNames.length === 0) {
    return { inserted: 0, skipped: 0, total: 0 };
  }

  const rows = [];
  const seenInBatch = new Set();
  for (const raw of displayNames) {
    const trimmed = String(raw || '').trim();
    if (!trimmed) continue;
    if (seenInBatch.has(trimmed)) continue;
    seenInBatch.add(trimmed);
    rows.push([trimmed, normalizeName(trimmed)]);
  }

  if (rows.length === 0) {
    return { inserted: 0, skipped: 0, total: 0 };
  }

  const db = getDb();
  const result = await db.sql`
    INSERT INTO seating_guests (display_name, name_normalized)
    VALUES ${db.sql.values(rows)}
    ON CONFLICT (display_name) DO NOTHING
    RETURNING id
  `;

  const inserted = rowsOf(result).length;
  const skipped = rows.length - inserted;
  return { inserted, skipped, total: rows.length };
}

/**
 * Apply seed assignments. Upsert by display_name so re-running with the same
 * seed file is a no-op. `name_normalized` is recomputed on conflict.
 *
 * @param {Array<{ displayName: string, tableId?: string|null }>} assignments
 * @returns {Promise<{ updated: number }>}
 */
async function applySeedAssignments(assignments) {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return { updated: 0 };
  }

  const db = getDb();
  let updated = 0;

  for (const item of assignments) {
    if (!item || typeof item !== 'object') continue;
    const displayName = String(item.displayName || '').trim();
    if (!displayName) continue;
    const tableId = item.tableId === '' || item.tableId === undefined ? null : item.tableId;
    const normalized = normalizeName(displayName);

    await db.sql`
      INSERT INTO seating_guests (display_name, name_normalized, table_id)
      VALUES (${displayName}, ${normalized}, ${tableId})
      ON CONFLICT (display_name)
      DO UPDATE SET
        table_id = EXCLUDED.table_id,
        name_normalized = EXCLUDED.name_normalized
    `;
    updated += 1;
  }

  return { updated };
}

/**
 * Public lookup. Two-stage flow per the plan:
 *
 *  - If `displayName` is provided (after an ambiguity prompt) → exact match,
 *    return the single guest's table or `unassigned`.
 *  - Else normalize `name` and search by name_normalized (exact) plus a
 *    parameterized ILIKE pattern. 0 matches → not found; 1 match → return;
 *    >1 match → `{ ambiguous: true, options: [{ displayName }] }`.
 *
 * Never returns `display_name` for non-matching rows and never returns the
 * full chart.
 *
 * @param {{ name?: string, displayName?: string }} input
 */
async function lookupGuest({ name, displayName }) {
  const db = getDb();

  if (displayName && String(displayName).trim()) {
    const exact = String(displayName).trim();
    const result = await db.sql`
      SELECT g.display_name, t.label AS table_label, g.table_id
      FROM seating_guests g
      LEFT JOIN seating_tables t ON g.table_id = t.id
      WHERE g.display_name = ${exact}
      LIMIT 1
    `;
    const exactRows = rowsOf(result);
    if (exactRows.length === 0) {
      return { found: false };
    }
    const row = exactRows[0];
    if (!row.table_id) {
      return { found: false, unassigned: true, displayName: row.display_name };
    }
    return {
      found: true,
      displayName: row.display_name,
      tableLabel: row.table_label
    };
  }

  const normalized = normalizeName(name || '');
  if (!normalized) {
    return { found: false, invalid: true };
  }

  // Escape LIKE wildcards in the user-supplied normalized term so a guest
  // searching for "100%" doesn't get a substring match. Parameterization is
  // still handled by the tagged template — this just neutralizes meta-chars.
  const escapedNormalized = normalized
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
  const pattern = `%${escapedNormalized}%`;

  const matchResult = await db.sql`
    SELECT g.display_name, t.label AS table_label, g.table_id
    FROM seating_guests g
    LEFT JOIN seating_tables t ON g.table_id = t.id
    WHERE g.name_normalized = ${normalized}
       OR g.name_normalized ILIKE ${pattern}
       OR lower(g.display_name) ILIKE ${pattern}
    ORDER BY (g.name_normalized = ${normalized}) DESC, g.display_name ASC
    LIMIT 25
  `;

  const matches = rowsOf(matchResult);

  if (matches.length === 0) {
    return { found: false };
  }

  if (matches.length > 1) {
    return {
      found: false,
      ambiguous: true,
      options: matches.map((row) => ({ displayName: row.display_name }))
    };
  }

  const row = matches[0];
  if (!row.table_id) {
    return { found: false, unassigned: true, displayName: row.display_name };
  }

  return {
    found: true,
    displayName: row.display_name,
    tableLabel: row.table_label
  };
}

/**
 * `SEATING_ENABLED` env flag. Defaults to enabled when unset/empty so existing
 * deployments don't break. The public lookup endpoint MUST honor this.
 * @returns {boolean}
 */
function isSeatingEnabled() {
  const flag = process.env.SEATING_ENABLED;
  if (flag === undefined || flag === '') return true;
  return flag === 'true' || flag === '1';
}

/**
 * Redact a guest name for log output. Keeps the first character of each
 * whitespace-separated token so log lines stay debuggable without exposing
 * the full PII. e.g. "Stéphanie Pete" → "S*** P***".
 * @param {string|undefined} name
 */
function redactName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `${token.charAt(0)}***`)
    .join(' ');
}

module.exports = {
  normalizeName,
  getDb,
  decodeAdminSecret,
  readAdminHeader,
  requireAdminAuth,
  generateRequestId,
  redactName,
  getSeatingChart,
  saveSeatingAssignments,
  importGuestNames,
  applySeedAssignments,
  lookupGuest,
  isSeatingEnabled
};
