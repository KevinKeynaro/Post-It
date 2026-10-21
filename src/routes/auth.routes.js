const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middleWares/validate");
const { registerSchema, loginSchema } = require("../validations/auth.schema");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;
