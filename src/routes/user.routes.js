const { Router } = require("express");
const verifyToken = require("../middleWares/verifyToken");
const upload = require("../middleWares/upload");
const userController = require("../controllers/user.controller");

const router = Router();

router.use(verifyToken);

router.get("/me", userController.getMe);
router.post("/me/avatar", upload.single("avatar"), userController.uploadAvatar);

module.exports = router;
