// Middleware terpusat untuk menangani error
const errorHandler = (err, req, res, next) => {
  // Catat detail error di server console
  console.error(err.stack || err);

  // Tangani error parsing JSON body dari express.json()
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
  }

  // Jika error memiliki status code eksplisit (misal 400, 401, 403, 404, 409)
  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    return res.status(status).json({
      success: false,
      message: err.message || "Request error",
    });
  }

  // Error server umum tanpa status eksplisit
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

module.exports = errorHandler;
