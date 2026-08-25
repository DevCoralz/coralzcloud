import { z } from "zod";

// Usernames: letters, numbers, underscores, dots, hyphens. No spaces,
// nothing that would break a URL or a Telegram-style handle later.
const usernamePattern = /^[a-zA-Z0-9_.-]+$/;

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(usernamePattern, "Username can only contain letters, numbers, dots, hyphens, and underscores"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  displayName: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

export function formatZodError(error) {
  const fieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
