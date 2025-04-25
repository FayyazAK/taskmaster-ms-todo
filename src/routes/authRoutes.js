const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/authController");
const { validateRequest } = require("../middleware/auth");

router.post("/signup", register);
router.post("/login", login);
router.get("/current-user", validateRequest, getCurrentUser);
router.post("/logout", validateRequest, logout);

module.exports = router;
