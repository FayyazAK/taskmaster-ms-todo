const config = require("./env");

module.exports = {
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
  refreshTokenExpiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
  cookieOptions: {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: config.COOKIE_EXPIRES_IN,
  },
};
