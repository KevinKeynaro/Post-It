const { z } = require("zod");

// Register schema (unrecognized fields like 'role' are ignored)
const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name cannot be empty"),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must not exceed 72 characters"),
});

// Login schema
const loginSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email format"),
    password: z
      .string({ error: "Password is required" })
      .min(1, "Password cannot be empty")
      .max(72, "Password must not exceed 72 characters"),
  })
  .strict();

module.exports = {
  registerSchema,
  loginSchema,
};
