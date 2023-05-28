const bcrypt = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require('../helper/helper');
const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} = require('../errors/errors');
const {
  createUserSchema,
  loginUserSchema,
} = require('../joiSchemas/joiSchemas');

const User = require('../models/User');

const createUser = async (req, res, next) => {
  try {
    // Validate request and extract values from body
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }
    const { username, password } = value;

    // Check user doesn't already exist
    const userExists = await User.findOne({ username });
    if (userExists) {
      throw new ConflictError('User already exists');
    }

    // salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with secure password
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    // Add refresh token to browser cookie
    const refreshToken = generateRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    const userData = prepareUserData(user);

    // Finally, send user data back to the client
    res.status(201).json({
      userData,
      // Send access token with response
      accessToken: generateAccessToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    // Validate request and extract values from body
    const { error, value } = loginUserSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }
    const { username, password } = value;

    // Check username exists and populate recipeMenu and shoppingList if they exist
    const user = await User.findOne({ username }).populate(
      'recipeMenu shoppingList'
    );
    if (!user) {
      throw new BadRequestError('Username or password is incorrect');
    }
    // Check password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestError('Username or password is incorrect');
    }

    // Add refresh token to browser cookie
    const refreshToken = generateRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    const userData = prepareUserData(user);

    res.status(200).json({
      userData,
      // Send access token with response
      accessToken: generateAccessToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

const checkRefreshToken = (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken)
    throw new UnauthorizedError('No refresh token', 'NO_TOKEN');

  const refreshToken = cookies.refreshToken;

  try {
    const { _id } = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(_id);

    res.json({ accessToken: accessToken, _id });
  } catch (err) {
    res.clearCookie('refreshToken');
    next(err);
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'User logged out' });
};

const getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const userData = prepareUserData(user);
    res.status(200).json({
      userData,
      accessToken: generateAccessToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// Helper
function prepareUserData(user) {
  let userData = {
    _id: user._id,
    username: user.username,
    isAdmin: user.isAdmin,
    favouriteRecipes: user.favouriteRecipes,
  };
  if (user.recipeMenu) userData.recipeMenu = user.recipeMenu;
  if (user.shoppingList) userData.shoppingList = user.shoppingList;

  return userData;
}

module.exports = {
  createUser,
  loginUser,
  checkRefreshToken,
  logoutUser,
  getUserInfo,
};
