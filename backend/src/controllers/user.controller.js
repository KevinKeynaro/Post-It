const pool = require("../db/connection");
const { uploadStream, deleteImage } = require("../config/cloudinary");

const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    const user = rows[0];
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar image is required",
      });
    }

    // Cek avatar lama user
    const [rows] = await pool.execute(
      "SELECT avatar_public_id FROM users WHERE id = ?",
      [req.user.id]
    );

    const currentUser = rows[0];
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload ke Cloudinary
    const result = await uploadStream(req.file.buffer);

    // Update database
    await pool.execute(
      "UPDATE users SET avatar_url = ?, avatar_public_id = ? WHERE id = ?",
      [result.secure_url, result.public_id, req.user.id]
    );

    // Bersihkan avatar lama dari Cloudinary jika ada
    if (currentUser.avatar_public_id) {
      try {
        await deleteImage(currentUser.avatar_public_id);
      } catch (cleanupErr) {
        console.error("Failed to delete old avatar:", cleanupErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar_url: result.secure_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMe,
  uploadAvatar,
};
