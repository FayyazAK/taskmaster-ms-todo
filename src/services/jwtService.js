const jwt = require("jsonwebtoken");
const config = require("../config/auth");

const generateToken = (user_id, role) => {
  return jwt.sign({ user_id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = { generateToken, verifyToken };
