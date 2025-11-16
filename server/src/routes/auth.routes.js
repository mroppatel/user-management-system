const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authController = require("../controllers/auth.controller");
const googleController = require("../controllers/googleAuth.controller");

const {
  registerValidation,
  loginValidation,
} = require("../validations/auth.validation");

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// Normal Auth
router.post(
  "/register",
  upload.single("profileImage"),
  registerValidation,
  authController.register
);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", loginValidation, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);

// Google Login
router.get("/google/url", googleController.getGoogleAuthURL);
router.get("/google/callback", googleController.googleCallback);

module.exports = router;
