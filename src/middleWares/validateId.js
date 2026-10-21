const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  req.params.id = parseInt(id, 10);
  next();
};

module.exports = validateId;
