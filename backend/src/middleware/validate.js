import { formatZodError } from "../validation/authSchemas.js";

/**
 * Validates req.body against a zod schema. On success, replaces
 * req.body with the parsed (trimmed/coerced) value. On failure,
 * responds 422 with per-field error messages the frontend can map
 * straight onto its existing form fields.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          fields: formatZodError(result.error),
        },
      });
    }
    req.body = result.data;
    next();
  };
}
