-- Where a file's bytes actually live. One row per stored copy — kept
-- separate from `files` so the storage backend (Telegram today,
-- potentially others later) is an implementation detail. Nothing in
-- this phase writes to this table; it exists so the next phase's
-- upload/download work has a schema to land on.
CREATE TABLE storage_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files (id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'telegram' CHECK (provider IN ('telegram')),
  -- Telegram-specific location: which storage channel, which message
  -- holds the uploaded document, plus the file's own identifiers so it
  -- can be re-fetched without re-resolving the message every time.
  telegram_channel_id TEXT,
  telegram_message_id TEXT,
  telegram_file_id TEXT,
  telegram_access_hash TEXT,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_count INTEGER NOT NULL DEFAULT 1,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX storage_objects_file_id_idx ON storage_objects (file_id);

-- DOWN
DROP TABLE IF EXISTS storage_objects;
