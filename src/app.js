require("dotenv").config();
const express = require("express");
require("./db/connection"); // inisialisasi koneksi MySQL

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const notFound = require("./middleWares/notFound");
const errorHandler = require("./middleWares/errorHandler");

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

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

// Handler 404 jika route tidak ditemukan
app.use(notFound);

// Error handler pusat
app.use(errorHandler);

// Jalankan server jika dijalankan langsung
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
