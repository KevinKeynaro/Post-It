const pool = require("../db/connection");

const getAllUsers = async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, avatar_url, created_at FROM users"
  );

  res.status(200).json({
    success: true,
    data: rows,
  });
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?",
      [id]
    );

    const user = rows[0];
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    if (err.code === "ER_TRUNCATED_WRONG_VALUE" || err.code === "WARN_DATA_TRUNCATED") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    throw err;
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (Number(id) === req.user.id) {
    return res.status(400).json({
      success: false,
      message: "Admin cannot delete own account",
    });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    if (err.code === "ER_TRUNCATED_WRONG_VALUE" || err.code === "WARN_DATA_TRUNCATED") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    throw err;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
};
