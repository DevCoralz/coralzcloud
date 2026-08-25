import {
  createUser,
  findUserByEmailOrUsername,
  findUserForLogin,
  toPublicUser,
  touchLastLogin,
} from "../models/userModel.js";
import { hashPassword, verifyPassword } from "./passwordService.js";

export class AuthError extends Error {
  constructor(message, { status = 400, fields = null, code = "AUTH_ERROR" } = {}) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

export async function registerUser({ username, email, password, displayName }) {
  const existing = await findUserByEmailOrUsername(email, username);
  if (existing) {
    const fields = {};
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      fields.email = "An account with this email already exists";
    }
    if (existing.username.toLowerCase() === username.toLowerCase()) {
      fields.username = "This username is already taken";
    }
    throw new AuthError("Registration failed", { status: 409, fields, code: "USER_EXISTS" });
  }

  const passwordHash = await hashPassword(password);
  const row = await createUser({ username, email, passwordHash, displayName });
  return toPublicUser(row);
}

export async function loginUser({ identifier, password }) {
  const row = await findUserForLogin(identifier);
  if (!row) {
    throw new AuthError("Invalid email/username or password", {
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const passwordMatches = await verifyPassword(row.password_hash, password);
  if (!passwordMatches) {
    throw new AuthError("Invalid email/username or password", {
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  if (!row.is_active) {
    throw new AuthError("This account has been deactivated", {
      status: 403,
      code: "ACCOUNT_INACTIVE",
    });
  }

  await touchLastLogin(row.id);
  return toPublicUser(row);
}
