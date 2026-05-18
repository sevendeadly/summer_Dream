CREATE TABLE IF NOT EXISTS seating_tables (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  capacity INT,
  sort_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS seating_guests (
  id SERIAL PRIMARY KEY,
  display_name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  table_id TEXT REFERENCES seating_tables(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (display_name)
);

CREATE INDEX IF NOT EXISTS idx_seating_guests_normalized ON seating_guests (name_normalized);

INSERT INTO seating_tables (id, label, capacity, sort_order) VALUES
  ('1', 'Table 1', 8, 1),
  ('2', 'Table 2', 8, 2),
  ('3', 'Table 3', 8, 3),
  ('4', 'Table 4', 8, 4),
  ('5', 'Table 5', 8, 5),
  ('6', 'Table 6', 8, 6),
  ('7', 'Table 7', 8, 7),
  ('8', 'Table 8', 8, 8),
  ('9', 'Table 9', 8, 9),
  ('10', 'Prestataires', NULL, 10)
ON CONFLICT (id) DO NOTHING;
