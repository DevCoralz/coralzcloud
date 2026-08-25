-- Enable UUID generation used as the primary key type across the schema.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- DOWN
DROP EXTENSION IF EXISTS "pgcrypto";
