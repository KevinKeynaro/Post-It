const { Router } = require("express");
const verifyToken = require("../middleWares/verifyToken");
const isAdmin = require("../middleWares/isAdmin");
const adminController = require("../controllers/admin.controller");

const router = Router();

router.use(verifyToken, isAdmin);

router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
