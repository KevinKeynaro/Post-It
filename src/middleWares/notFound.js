// Middleware to handle 404 Not Found routes
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

module.exports = notFound;
