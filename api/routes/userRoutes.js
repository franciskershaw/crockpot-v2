const express = require('express');
const asyncHandler = require('express-async-handler');
const { isLoggedIn } = require('../middleware/authMiddleware');
const {
  createUser,
  loginUser,
  checkRefreshToken,
  logoutUser,
  getUserInfo,
} = require('../controllers/userController');

const router = express.Router();

router
  .route('/')
  .get(isLoggedIn, asyncHandler(getUserInfo)) // Get user info
  .post(asyncHandler(createUser)); // Register new user

router.route('/login').post(asyncHandler(loginUser)); // Login a user

router.route('/refreshToken').get(checkRefreshToken); // Check refresh token

router.route('/logout').post(logoutUser); // Logout

module.exports = router;
