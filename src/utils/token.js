const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
    },
    secret,
    { expiresIn: "1d" }
  );
};

module.exports = {
  generateToken,
};
