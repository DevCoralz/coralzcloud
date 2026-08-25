-- Folders form a self-referencing tree per user. NULL parent_id = root.
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_trashed BOOLEAN NOT NULL DEFAULT false,
  trashed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX folders_user_id_idx ON folders (user_id);
CREATE INDEX folders_parent_id_idx ON folders (parent_id);

CREATE TRIGGER folders_set_updated_at
BEFORE UPDATE ON folders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Files are the logical record a user sees; storage_objects (next
-- migration) holds where the bytes actually live (Telegram, etc.),
-- separated so a file can in principle be backed by different storage
-- providers later without reshaping this table.
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_trashed BOOLEAN NOT NULL DEFAULT false,
  trashed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX files_user_id_idx ON files (user_id);
CREATE INDEX files_folder_id_idx ON files (folder_id);

CREATE TRIGGER files_set_updated_at
BEFORE UPDATE ON files
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- DOWN
DROP TRIGGER IF EXISTS files_set_updated_at ON files;
DROP TABLE IF EXISTS files;
DROP TRIGGER IF EXISTS folders_set_updated_at ON folders;
DROP TABLE IF EXISTS folders;
