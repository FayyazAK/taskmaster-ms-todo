const User = require("../models/User");
const {
  validateEmail,
  validatePassword,
  hashPassword,
  sanitizeUser,
  sanitizeUsers,
} = require("../utils/userUtils");
const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.success(sanitizeUsers(users), MSG.USERS_RETRIEVED, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

// Get single user (admin only)
const getUserById = async (req, res) => {
  try {
    const user_id = req.params.id;
    if (!user_id) {
      return res.error(MSG.USER_ID_REQUIRED, STATUS.BAD_REQUEST);
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.error(MSG.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }
    // Remove sensitive data
    res.success(sanitizeUser(user), MSG.USER_RETRIEVED, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
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
    // Remove sensitive data
    res.success(sanitizeUser(newUser), MSG.USER_CREATED, STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const user_id = req.params.id;
    const { firstName, lastName, username, email, password } = req.body;

    if (!user_id) {
      return res.error(MSG.USER_ID_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Check if user exists
    const existingUser = await User.findById(user_id);
    if (!existingUser) {
      return res.error(MSG.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return res.error(MSG.INVALID_EMAIL, STATUS.BAD_REQUEST);
    }

    // Validate password if provided
    if (password && !validatePassword(password)) {
      return res.error(MSG.INVALID_PASSWORD, STATUS.BAD_REQUEST);
    }

    // Check for duplicate username
    if (username && username.toLowerCase() !== existingUser.username) {
      const existingUsername = await User.findByUsername(
        username.toLowerCase()
      );
      if (existingUsername) {
        return res.error(MSG.USERNAME_TAKEN, STATUS.CONFLICT);
      }
    }

    // Check for duplicate email
    if (email && email.toLowerCase() !== existingUser.email) {
      const existingEmail = await User.findByEmail(email.toLowerCase());
      if (existingEmail) {
        return res.error(MSG.USER_EMAIL_TAKEN, STATUS.CONFLICT);
      }
    }

    // Prepare update data
    const updateData = {
      firstName: firstName || existingUser.first_name,
      lastName: lastName || existingUser.last_name,
      username: username ? username.toLowerCase() : existingUser.username,
      email: email ? email.toLowerCase() : existingUser.email,
      password: password ? await hashPassword(password) : existingUser.password,
    };

    // Update user
    await User.update(user_id, updateData);
    const updatedUser = await User.findById(user_id);
    // Remove sensitive data
    res.success(sanitizeUser(updatedUser), MSG.USER_UPDATED, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user_id = req.params.id;

    if (!user_id) {
      return res.error(MSG.USER_ID_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Check if user exists
    const existingUser = await User.findById(user_id);
    if (!existingUser) {
      return res.error(MSG.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }

    await User.delete(user_id);
    res.success(null, MSG.USER_DELETED, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

// Update profile (user only)
const updateProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { firstName, lastName, email, username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findById(user_id);
    if (!existingUser) {
      return res.error(MSG.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }

    // Create update data object with only the fields to change
    const updateData = {};

    // Validate and add fields only if they're provided
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    if (email !== undefined) {
      if (!validateEmail(email)) {
        return res.error(MSG.INVALID_EMAIL, STATUS.BAD_REQUEST);
      }

      if (email.toLowerCase() !== existingUser.email) {
        const existingEmail = await User.findByEmail(email.toLowerCase());
        if (existingEmail) {
          return res.error(MSG.USER_EMAIL_TAKEN, STATUS.CONFLICT);
        }
      }
      updateData.email = email.toLowerCase();
    }

    if (username !== undefined) {
      if (username.toLowerCase() !== existingUser.username) {
        const existingUsername = await User.findByUsername(
          username.toLowerCase()
        );
        if (existingUsername) {
          return res.error(MSG.USERNAME_TAKEN, STATUS.CONFLICT);
        }
      }
      updateData.username = username.toLowerCase();
    }

    if (password !== undefined) {
      if (!validatePassword(password)) {
        return res.error(MSG.INVALID_PASSWORD, STATUS.BAD_REQUEST);
      }
      updateData.password = await hashPassword(password);
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await User.update(user_id, updateData);
    }

    const updatedUser = await User.findById(user_id);

    res.success(sanitizeUser(updatedUser), MSG.USER_UPDATED, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
};
