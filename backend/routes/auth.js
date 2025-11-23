const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Login
router.post(
  "/login",
  [body("password").notEmpty().withMessage("Password is required")],
  async (req, res) => {
    console.log(req.body);
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { password } = req.body;

      // Fetch the (only) admin user. If you later add more users, switch to a proper identity field.
      const user = await prisma.user.findFirst({
        select: { id: true, password: true }, // least-privilege read
      }); // returns null if none exists
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please run database seed.",
        });
      }

      // Compare plaintext password to stored bcrypt hash
      
      const isMatch = await bcrypt.compare(password, user.password);
      // const isMatch = password === user.password; // TEMPORARY: remove bcrypt for initial setup ease
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid password" });
      }

      // Safety: make sure envs exist
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message: "Server misconfiguration: JWT_SECRET is not set",
        });
      }

      // Issue JWT (add short expiry via env, e.g. "1d")
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: { id: user.id },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Server error during login" });
    }
  }
);

// Change password
router.post(
  "/change-password",
  [
    body(["key", "oldPassword"])
      .custom((value, { req }) => {
        // allow either 'key' or 'oldPassword' (UI sends 'oldPassword' as the key)
        return Boolean(value || req.body.key || req.body.oldPassword);
      })
      .withMessage("Authorization key is required"),
    body("newPassword")
      .notEmpty().withMessage("New password is required")
      .isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  async (req, res) => {
    try {
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const providedKey = (req.body.key ?? req.body.oldPassword ?? "").trim();
      const { newPassword } = req.body;

      // Fetch the (only) admin user
      const user = await prisma.user.findFirst({
        select: { id: true, changePasswordKey: true },
      });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Compare the provided key with the stored changePasswordKey
      if (!user.changePasswordKey || providedKey !== user.changePasswordKey) {
        return res.status(403).json({ success: false, message: "Invalid authorization key" });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ success: false, message: "Server error during password change" });
    }
  }
);

// Verify token
router.get("/verify", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
});

module.exports = router;
