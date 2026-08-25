import { query } from "../db/pool.js";

const PUBLIC_COLUMNS = `
  id, username, email, display_name, is_active,
  email_verified_at, last_login_at, created_at, updated_at
`;

/**
 * Strip everything except the columns safe to send to the client.
 */
export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    displayName: row.display_name,
    isActive: row.is_active,
    emailVerifiedAt: row.email_verified_at,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findUserById(id) {
  const { rows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

/**
 * Find a user by email OR username (case-insensitive), including the
 * password hash — used only for the login check.
 */
export async function findUserForLogin(identifier) {
  const { rows } = await query(
    `SELECT id, username, email, password_hash, display_name, is_active,
            email_verified_at, last_login_at, created_at, updated_at
     FROM users
     WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)
     LIMIT 1`,
    [identifier]
  );
  return rows[0] || null;
}

export async function findUserByEmailOrUsername(email, username) {
  const { rows } = await query(
    `SELECT id, username, email FROM users
     WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)
     LIMIT 1`,
    [email, username]
  );
  return rows[0] || null;
}

export async function createUser({ username, email, passwordHash, displayName }) {
  const { rows } = await query(
    `INSERT INTO users (username, email, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [username, email, passwordHash, displayName || null]
  );
  return rows[0];
}

export async function touchLastLogin(userId) {
  await query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [userId]);
}
