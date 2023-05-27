const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateShoppingList, generateAccessToken, generateRefreshToken, verifyToken } = require('../helper/helper');
const asyncHandler = require('express-async-handler');
const { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } = require('../errors/errors');

const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Item = require('../models/Item');
const { isLoggedIn, isRightUser } = require('../middleware/authMiddleware');

// Register new user
router.post('/', asyncHandler(async (req, res, next) => {
    try {
      const { username, password } = req.body;
      // Validation
      if (!username || !password) {
        throw new BadRequestError('Please include all fields');
      }
      // Check user doesn't already exist
      const userExists = await User.findOne({ username });
      if (userExists) {
        throw new ConflictError('User already exists');
      }
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Create user
      const user = await User.create({
        username,
        password: hashedPassword,
        isAdmin: false,
        favouriteRecipes: [],
        recipeMenu: [],
        shoppingList: [],
        regularItems: [],
        extraItems: [],
      });
      if (user) {
        // Add refresh token to browser cookie
        const refreshToken = generateRefreshToken(user._id);
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        res.status(201).json({
          _id: user._id,
          username: user.username,
          isAdmin: user.isAdmin,
          favouriteRecipes: user.favouriteRecipes,
          recipeMenu: user.recipeMenu,
          shoppingList: user.shoppingList,
          regularItems: user.regularItems,
          extraItems: user.extraItems,
          // Send access token with response
          token: generateAccessToken(user._id),
        });
      } else {
        throw new BadRequestError('Invalid user data', 400);
      }
    } catch (err) {
      next(err);
    }
  })
);

// Login a user
router.post('/login', asyncHandler(async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        throw new BadRequestError('Username or password is incorrect');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new BadRequestError('Username or password is incorrect');
      }
      const refreshToken = generateRefreshToken(user._id);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      res.status(200).json({
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        favouriteRecipes: user.favouriteRecipes,
        recipeMenu: user.recipeMenu,
        shoppingList: user.shoppingList,
        regularItems: user.regularItems,
        extraItems: user.extraItems,
        token: generateAccessToken(user._id),
      });
    } catch (err) {
      next(err);
    }
  })
);

router.get('/refreshToken', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) throw new UnauthorizedError('No refresh token', 'NO_TOKEN');
    const refreshToken = cookies.refreshToken;
    try {
      const { _id } = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const accessToken = generateAccessToken(_id);
      res.json({ token: accessToken, _id });
    } catch (error) {
      res.clearCookie('refreshToken');
      throw new UnauthorizedError('Issues validating the token');
    }
  }
);

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken')
  res.status(200).json({ message: 'User logged out'})
})

router.get('/:userId', isLoggedIn, isRightUser, asyncHandler(async (req, res, next) => {
  try {
    if (!req.params.userId) {
      throw new NotFoundError('User not found')
    }
    const user = await User.findById(req.params.userId)
    res.status(200).json({
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      favouriteRecipes: user.favouriteRecipes,
      recipeMenu: user.recipeMenu,
      shoppingList: user.shoppingList,
      regularItems: user.regularItems,
      extraItems: user.extraItems,
      token: generateAccessToken(user._id),
    })
  } catch (err) {
    next(err)
  }
}))

// Get recipe menu from user
router.get('/:userId/recipeMenu', isLoggedIn, isRightUser, asyncHandler(async (req, res, next) => {
    try {
      const { recipeMenu } = await User.findById(req.params.userId);
      const recipes = await Recipe.find({ _id: { $in: recipeMenu } });
      const menu = [];

      for (const recipe of recipes) {
        const { serves } = recipeMenu.find((item) =>
          item._id.equals(recipe._id)
        );
        menu.push({ recipe, serves });
      }

      res.status(200).json(menu);
    } catch (err) {
      next(err);
    }
  })
);

// Get shopping list from user
router.get('/:userId/shoppingList', isLoggedIn, isRightUser, asyncHandler(async (req, res, next) => {
    try {
      const { shoppingList, extraItems } = await User.findById(
        req.params.userId
      );
      const shoppingListItems = await Item.find({ _id: { $in: shoppingList } });

      let list = [];

      for (const item of shoppingListItems) {
        const { quantity, unit, obtained } = shoppingList.find(
          (shoppingListItem) => item._id.equals(shoppingListItem._id)
        );
        list.push({ item, quantity, unit, obtained });
      }

      for (const item of extraItems) {
        const existing = list.find(
          (obj) => obj.item._id.equals(item._id) && obj.unit === item.unit
        );
        if (existing) {
          list = list.map((obj) => {
            if (obj.item._id.equals(item._id) && obj.unit === item.unit) {
              return { ...obj, quantity: obj.quantity + item.quantity };
            }
            return obj;
          });
        } else {
          const { quantity, unit, obtained } = item;
          const additional = await Item.findById(item._id);
          list.push({ item: additional, quantity, unit, obtained });
        }
      }

      res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  })
);

// Get favourites from user
router.get('/:userId/favourites', isLoggedIn, isRightUser, asyncHandler(async (req, res, next) => {
    try {
      const { favouriteRecipes } = await User.findById(req.params.userId);
      const favourites = await Recipe.find({ _id: { $in: favouriteRecipes } });

      res.status(200).json(favourites);
    } catch (err) {
      next(err);
    }
  })
);

// Edit user
router.put('/:userId', isLoggedIn, isRightUser, asyncHandler(async (req, res, next) => {
    try {
      let userToUpdate = await User.findById(req.params.userId);
      let shoppingList;
      let extraItems;

      if (req.body.recipeMenu) {
        shoppingList = await generateShoppingList(req.body.recipeMenu);
      } else {
        shoppingList = userToUpdate.shoppingList;
      }

      if (req.body.extraItems) {
        if (req.body.extraItems.length) {
          extraItems = userToUpdate.extraItems;
          extraItems.push(req.body.extraItems[0]);
        } else if (!req.body.extraItems.length) {
          // Pass in an empty array from the frontend if the user is to clear extraItems
          extraItems = [];
        }
      } else {
        extraItems = userToUpdate.extraItems;
      }

      let updates = { ...req.body, shoppingList, extraItems };
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        updates,
        { new: true }
      );
      if (req.body.recipeMenu) {
        const newShoppingList = await generateShoppingList(
          updatedUser.recipeMenu
        );
        updatedUser.shoppingList = newShoppingList;
        updatedUser.save();
      }
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  })
);

router.put('/:userId/shoppingList', isLoggedIn, isRightUser, asyncHandler(async (req, res, next) => {
    try {
      let userToUpdate = await User.findById(req.params.userId);
      let shoppingList = userToUpdate.shoppingList;
      let extraItems = userToUpdate.extraItems;

      for (let item of shoppingList) {
        if (item._id.equals(req.body.recipeId)) {
          item.obtained = !item.obtained;
        }
      }

      for (let item of extraItems) {
        if (item._id.equals(req.body.recipeId)) {
          item.obtained = !item.obtained;
        }
      }

      userToUpdate.shoppingList = shoppingList;
      userToUpdate.extraItems = extraItems;
      userToUpdate.save();
      res.status(200).json(shoppingList);
    } catch (err) {
      next(err);
    }
  })
);

module.exports = router;
