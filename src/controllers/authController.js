const User = require("../models/User");
const bcrypt = require("bcrypt");
const config = require("../config/auth");
const {
  validateEmail,
  validatePassword,
  hashPassword,
  sanitizeUser,
} = require("../utils/userUtils");
const MSG = require("../utils/messages");
const { generateToken } = require("../services/jwtService");
const STATUS = require("../utils/statusCodes");

// Register a new user
const register = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.error(MSG.SIGNUP_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    const { firstName, lastName, username, email, password } = req.body;

    // Validate required fields
    if (!firstName || !username || !email || !password) {
      return res.error(MSG.SIGNUP_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.error(MSG.INVALID_EMAIL, STATUS.BAD_REQUEST);
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.error(MSG.INVALID_PASSWORD, STATUS.BAD_REQUEST);
    }

    // Check for existing username
    const existingUsername = await User.findByUsername(username.toLowerCase());
    if (existingUsername) {
      return res.error(MSG.USERNAME_TAKEN, STATUS.CONFLICT);
    }

    // Check for existing email
    const existingEmail = await User.findByEmail(email.toLowerCase());
    if (existingEmail) {
      return res.error(MSG.USER_EMAIL_TAKEN, STATUS.CONFLICT);
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const user_id = await User.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const newUser = await User.findById(user_id);

    // Generate JWT token
    const token = generateToken(newUser.user_id, newUser.role);

    // Set cookie
    res.cookie("token", token, config.cookieOptions);

    res.success(sanitizeUser(newUser), MSG.USER_REGISTERED, STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.error(MSG.LOGIN_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.error(MSG.LOGIN_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Find user by email
    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      return res.error(MSG.INVALID_CREDENTIALS, STATUS.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.error(MSG.INVALID_CREDENTIALS, STATUS.UNAUTHORIZED);
    }

    // Generate JWT token
    const token = generateToken(user.user_id, user.role);

    // Set cookie
    res.cookie("token", token, config.cookieOptions);

    res.success(sanitizeUser(user), MSG.LOGIN_SUCCESS, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const user = await User.findById(user_id);
    if (!user) {
      return res.error(MSG.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }

    res.success(sanitizeUser(user), MSG.USER_FOUND, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.success(null, MSG.LOGOUT_SUCCESS, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
