import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/services/passwordService.js";

describe("passwordService", () => {
  test("hashes a password to a non-plaintext argon2 string", async () => {
    const hash = await hashPassword("correct horse battery staple");
    assert.notEqual(hash, "correct horse battery staple");
    assert.ok(hash.startsWith("$argon2id$"));
  });

  test("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("correct horse battery staple");
    const ok = await verifyPassword(hash, "correct horse battery staple");
    assert.equal(ok, true);
  });

  test("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    const ok = await verifyPassword(hash, "wrong password");
    assert.equal(ok, false);
  });

  test("rejects a malformed hash instead of throwing", async () => {
    const ok = await verifyPassword("not-a-real-hash", "anything");
    assert.equal(ok, false);
  });

  test("two hashes of the same password are not identical (random salt)", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    assert.notEqual(a, b);
  });
});
