-- One row per user, updated whenever files are added/removed. Kept as
-- a running total (instead of always SUM()-ing files) so the storage
-- card on the dashboard is a cheap read.
CREATE TABLE storage_usage (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  used_bytes BIGINT NOT NULL DEFAULT 0,
  file_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION create_default_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO storage_usage (user_id, used_bytes, file_count)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_create_default_storage_usage
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_default_storage_usage();

-- DOWN
DROP TRIGGER IF EXISTS users_create_default_storage_usage ON users;
DROP FUNCTION IF EXISTS create_default_storage_usage();
DROP TABLE IF EXISTS storage_usage;
