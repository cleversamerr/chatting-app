const { Router } = require("express");
const router = Router();
const { authController } = require("../controllers");
const auth = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.signin);
router.get("/isauth", [auth("readOwn", "user")], authController.isAuth);
router.get("/verify", authController.verifyAccount);

module.exports = router;
