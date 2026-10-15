require("dotenv").config();
const express = require("express");
require("./db/connection"); // inisialisasi koneksi MySQL

const app = express();

// Middleware parsing JSON & URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint cek kesehatan server
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// Route belum ditemukan (404 handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan`,
  });
});

// Error handler pusat
app.use((err, req, res, next) => {
  console.error("Server error:", err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
