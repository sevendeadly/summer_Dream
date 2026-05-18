// ==================================
// SEATING DATABASE HELPERS
// ==================================

const { getDatabase } = require('@netlify/database');
const {
  TABLE_CAPACITY,
  PRESTATAIRES_TABLE_ID
} = require('../../../models/seating');

/**
 * Normalize guest name for lookup (trim, lowercase, NFD strip diacritics, collapse spaces).
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
 * @returns {import('@netlify/database').Database}
 */
function getDb() {
  return getDatabase();
}

/** @param {unknown} result */
function rowsOf(result) {
  if (Array.isArray(result)) return result;
  if (result && typeof result === 'object' && Array.isArray(result.rows)) {
    return result.rows;
  }
  return [];
}

/**
 * Decode X-Admin-Secret (supports base64 like get-rsvps.js).
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
    /* use as-is */
  }
  return headerValue;
}

/**
 * @param {import('@netlify/functions').HandlerEvent} event
 * @returns {{ ok: true } | { ok: false, statusCode: number, body: string }}
 */
function requireAdminAuth(event) {
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET) {
    return {
      ok: false,
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const secret = decodeAdminSecret(event.headers['x-admin-secret']);
  if (secret !== ADMIN_SECRET) {
    return {
      ok: false,
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized - invalid admin secret' })
    };
  }

  return { ok: true };
}

/**
 * @returns {Promise<{ tables: object[], guests: object[] }>}
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
 * @param {Array<{ id: number, tableId: string|null }>} assignments
 * @returns {Promise<{ ok: true } | { ok: false, error: string, overCapacity?: object[] }>}
 */
async function saveSeatingAssignments(assignments) {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return { ok: false, error: 'No assignments provided' };
  }

  const db = getDb();

  // Simulate final state for capacity check
  const chart = await getSeatingChart();
  const guestMap = new Map(chart.guests.map((g) => [g.id, { ...g }]));

  for (const item of assignments) {
    const guest = guestMap.get(item.id);
    if (!guest) {
      return { ok: false, error: `Guest id ${item.id} not found` };
    }
    guest.tableId = item.tableId === '' ? null : item.tableId;
  }

  const counts = {};
  for (const guest of guestMap.values()) {
    if (!guest.tableId) continue;
    counts[guest.tableId] = (counts[guest.tableId] || 0) + 1;
  }

  const overCapacity = [];
  for (const [tableId, count] of Object.entries(counts)) {
    if (tableId === PRESTATAIRES_TABLE_ID) continue;
    if (count > TABLE_CAPACITY) {
      const table = chart.tables.find((t) => t.id === tableId);
      overCapacity.push({
        tableId,
        label: table ? table.label : tableId,
        count,
        capacity: TABLE_CAPACITY
      });
    }
  }

  if (overCapacity.length > 0) {
    return {
      ok: false,
      error: 'One or more tables exceed capacity',
      overCapacity
    };
  }

  for (const item of assignments) {
    const tableId = item.tableId === '' || item.tableId === undefined ? null : item.tableId;
    await db.sql`
      UPDATE seating_guests
      SET table_id = ${tableId}
      WHERE id = ${item.id}
    `;
  }

  return { ok: true };
}

/**
 * @param {string[]} displayNames
 * @returns {Promise<{ inserted: number, skipped: number }>}
 */
async function importGuestNames(displayNames) {
  const db = getDb();
  let inserted = 0;
  let skipped = 0;

  for (const displayName of displayNames) {
    const trimmed = String(displayName).trim();
    if (!trimmed) continue;
    const normalized = normalizeName(trimmed);

    const result = await db.sql`
      INSERT INTO seating_guests (display_name, name_normalized)
      VALUES (${trimmed}, ${normalized})
      ON CONFLICT (display_name) DO NOTHING
      RETURNING id
    `;

    if (rowsOf(result).length > 0) {
      inserted += 1;
    } else {
      skipped += 1;
    }
  }

  return { inserted, skipped };
}

/**
 * Apply seed assignments from seating-seed.json shape.
 * @param {Array<{ displayName: string, tableId: string|null }>} assignments
 */
async function applySeedAssignments(assignments) {
  const db = getDb();
  let updated = 0;

  for (const item of assignments) {
    const displayName = String(item.displayName || '').trim();
    if (!displayName) continue;
    const tableId = item.tableId || null;
    const normalized = normalizeName(displayName);

    await db.sql`
      INSERT INTO seating_guests (display_name, name_normalized, table_id)
      VALUES (${displayName}, ${normalized}, ${tableId})
      ON CONFLICT (display_name)
      DO UPDATE SET table_id = EXCLUDED.table_id, name_normalized = EXCLUDED.name_normalized
    `;
    updated += 1;
  }

  return { updated };
}

/**
 * Lookup a single guest by name or exact displayName.
 * @param {{ name?: string, displayName?: string }}
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

  const pattern = `%${normalized.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;

  const exactResult = await db.sql`
    SELECT g.display_name, t.label AS table_label, g.table_id
    FROM seating_guests g
    LEFT JOIN seating_tables t ON g.table_id = t.id
    WHERE g.name_normalized = ${normalized}
  `;

  const fuzzyResult = await db.sql`
    SELECT g.display_name, t.label AS table_label, g.table_id
    FROM seating_guests g
    LEFT JOIN seating_tables t ON g.table_id = t.id
    WHERE g.name_normalized ILIKE ${pattern}
       OR lower(g.display_name) ILIKE ${pattern}
  `;

  const seen = new Set();
  const matches = [];

  for (const rows of [rowsOf(exactResult), rowsOf(fuzzyResult)]) {
    for (const row of rows) {
      if (seen.has(row.display_name)) continue;
      seen.add(row.display_name);
      matches.push(row);
    }
  }

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

function isSeatingEnabled() {
  const flag = process.env.SEATING_ENABLED;
  if (flag === undefined || flag === '') return true;
  return flag === 'true' || flag === '1';
}

module.exports = {
  normalizeName,
  getDb,
  decodeAdminSecret,
  requireAdminAuth,
  getSeatingChart,
  saveSeatingAssignments,
  importGuestNames,
  applySeedAssignments,
  lookupGuest,
  isSeatingEnabled
};
