const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
  },
  favouriteRecipes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
  ],
  recipeMenu: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      serves: Number,
    },
  ],
  shoppingList: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      unit: String,
      obtained: Boolean,
    },
  ],
  regularItems: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      unit: String,
    },
  ],
  extraItems: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      unit: String,
      obtained: Boolean,
    },
  ],
});

// middleware to remove deleted recipe from user's 'favouriteRecipes' and 'recipeMenu'
UserSchema.pre('findOneAndDelete', async function (next) {
  try {
    const deletedRecipe = await this.findOne();
    const recipeId = deletedRecipe._id;
    
    // remove recipe id from user's 'favouriteRecipes'
    await User.updateMany(
      { favouriteRecipes: recipeId },
      { $pull: { favouriteRecipes: recipeId } }
    );

    // remove recipe id from user's 'recipeMenu'
    await User.updateMany(
      { 'recipeMenu._id': recipeId },
      { $pull: { recipeMenu: { _id: recipeId } } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', UserSchema);
