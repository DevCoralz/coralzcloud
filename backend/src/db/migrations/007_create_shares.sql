-- Sharing applies to either a file or a folder (exactly one of the two
-- is set). Either shared directly with another user, or via a public
-- link token (share_token set, shared_with_user_id null).
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  file_id UUID REFERENCES files (id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders (id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users (id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shares_target_check CHECK (
    (file_id IS NOT NULL AND folder_id IS NULL) OR
    (file_id IS NULL AND folder_id IS NOT NULL)
  ),
  CONSTRAINT shares_recipient_check CHECK (
    shared_with_user_id IS NOT NULL OR share_token IS NOT NULL
  )
);

CREATE INDEX shares_owner_id_idx ON shares (owner_id);
CREATE INDEX shares_file_id_idx ON shares (file_id);
CREATE INDEX shares_folder_id_idx ON shares (folder_id);
CREATE INDEX shares_shared_with_user_id_idx ON shares (shared_with_user_id);

-- DOWN
DROP TABLE IF EXISTS shares;
