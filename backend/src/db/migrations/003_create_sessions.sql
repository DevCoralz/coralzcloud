-- Session store table, in the shape connect-pg-simple expects.
-- https://github.com/voxpelli/node-connect-pg-simple
CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX session_expire_idx ON session (expire);

-- DOWN
DROP TABLE IF EXISTS session;
