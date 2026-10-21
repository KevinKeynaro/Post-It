const { Router } = require("express");
const verifyToken = require("../middleWares/verifyToken");
const isAdmin = require("../middleWares/isAdmin");
const validateId = require("../middleWares/validateId");
const adminController = require("../controllers/admin.controller");

const router = Router();

router.use(verifyToken, isAdmin);

router.get("/users", adminController.getAllUsers);
router.get("/users/:id", validateId, adminController.getUserById);
router.delete("/users/:id", validateId, adminController.deleteUser);

module.exports = router;
