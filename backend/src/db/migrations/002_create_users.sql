CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness for both login identifiers.
CREATE UNIQUE INDEX users_username_lower_idx ON users (LOWER(username));
CREATE UNIQUE INDEX users_email_lower_idx ON users (LOWER(email));

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- DOWN
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
DROP FUNCTION IF EXISTS set_updated_at();
DROP TABLE IF EXISTS users;
