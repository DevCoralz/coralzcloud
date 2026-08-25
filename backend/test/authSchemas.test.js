import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { registerSchema, loginSchema } from "../src/validation/authSchemas.js";

describe("registerSchema", () => {
  test("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      username: "coral_user",
      email: "user@example.com",
      password: "supersecret123",
    });
    assert.equal(result.success, true);
  });

  test("rejects a short username", () => {
    const result = registerSchema.safeParse({
      username: "ab",
      email: "user@example.com",
      password: "supersecret123",
    });
    assert.equal(result.success, false);
  });

  test("rejects a username with spaces", () => {
    const result = registerSchema.safeParse({
      username: "my user",
      email: "user@example.com",
      password: "supersecret123",
    });
    assert.equal(result.success, false);
  });

  test("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      username: "coraluser",
      email: "not-an-email",
      password: "supersecret123",
    });
    assert.equal(result.success, false);
  });

  test("rejects a short password", () => {
    const result = registerSchema.safeParse({
      username: "coraluser",
      email: "user@example.com",
      password: "short",
    });
    assert.equal(result.success, false);
  });

  test("trims whitespace from username and email", () => {
    const result = registerSchema.safeParse({
      username: "  coraluser  ",
      email: "  user@example.com  ",
      password: "supersecret123",
    });
    assert.equal(result.success, true);
    assert.equal(result.data.username, "coraluser");
    assert.equal(result.data.email, "user@example.com");
  });
});

describe("loginSchema", () => {
  test("accepts email as identifier", () => {
    const result = loginSchema.safeParse({ identifier: "user@example.com", password: "x" });
    assert.equal(result.success, true);
  });

  test("accepts username as identifier", () => {
    const result = loginSchema.safeParse({ identifier: "coraluser", password: "x" });
    assert.equal(result.success, true);
  });

  test("rejects an empty identifier", () => {
    const result = loginSchema.safeParse({ identifier: "", password: "x" });
    assert.equal(result.success, false);
  });

  test("rejects an empty password", () => {
    const result = loginSchema.safeParse({ identifier: "user@example.com", password: "" });
    assert.equal(result.success, false);
  });
});
