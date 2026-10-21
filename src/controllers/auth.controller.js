const bcrypt = require("bcrypt");
const pool = require("../db/connection");
const { generateToken } = require("../utils/token");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already exists
  const [existing] = await pool.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: result.insertId,
        name,
        email,
        role: "user",
      },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }
    throw err;
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.execute(
    "SELECT id, name, email, password, role FROM users WHERE email = ?",
    [email]
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = generateToken({ id: user.id, role: user.role });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

module.exports = {
  register,
  login,
};
