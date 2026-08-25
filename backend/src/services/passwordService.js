import argon2 from "argon2";

// argon2id is the recommended variant — resistant to both GPU
// cracking and side-channel attacks. Cost parameters follow the
// OWASP baseline recommendation for interactive login.
const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, HASH_OPTIONS);
}

export async function verifyPassword(hash, plainPassword) {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    // Malformed hash, algorithm mismatch, etc. — treat as invalid
    // rather than throwing, so callers only ever need a boolean.
    return false;
  }
}
