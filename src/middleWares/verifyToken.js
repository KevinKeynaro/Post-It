const jwt = require("jsonwebtoken");
const pool = require("../db/connection");

const verifyToken = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error("JWT_SECRET is not configured"));
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || !parts[1]) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format",
    });
  }

  const token = parts[1];

  let decoded;
  try {
    decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT id, role FROM users WHERE id = ?",
      [decoded.id]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (dbErr) {
    next(dbErr);
  }
};

module.exports = verifyToken;
