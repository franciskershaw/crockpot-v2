const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { isLoggedIn } = require('../middleware/authMiddleware');
const { getRecipeMenu } = require('../controllers/recipeMenuController');

router.get('/', isLoggedIn, asyncHandler(getRecipeMenu));

module.exports = router;
