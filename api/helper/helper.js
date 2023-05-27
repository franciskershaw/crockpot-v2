const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign({ _id: id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ _id: id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
