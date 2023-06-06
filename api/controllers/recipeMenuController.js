const RecipeMenu = require('../models/RecipeMenu');
const User = require('../models/User');

const getRecipeMenu = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.recipeMenu) {
      const recipeMenu = new RecipeMenu({ user: user._id });
      await recipeMenu.save();
      user.recipeMenu = recipeMenu._id;
      await user.save();
    }

    const recipeMenu = await RecipeMenu.findById(user.recipeMenu);

    res.status(200).json(recipeMenu);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecipeMenu,
};
