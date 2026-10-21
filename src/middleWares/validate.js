// Middleware factory untuk validasi req.body menggunakan Zod schema
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Format pesan error per field
    const errorMessages = result.error.issues.map((issue) => {
      let field = issue.path && issue.path.length > 0 ? issue.path.join(".") : "";
      if (!field && issue.keys && issue.keys.length > 0) {
        field = issue.keys.join(", ");
      }
      return field ? `${field}: ${issue.message}` : issue.message;
    });

    return res.status(400).json({
      success: false,
      message: errorMessages.join("; "),
    });
  }

  // Jika valid, ganti req.body dengan data hasil parsing yang bersih
  req.body = result.data;
  next();
};

module.exports = validate;
