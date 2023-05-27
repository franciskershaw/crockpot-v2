const mongoose = require('mongoose');
const User = require('./User');

const ingredientSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    unit: String,
  },
  { _id: false }
);

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timeInMinutes: {
    type: Number,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  ingredients: [ingredientSchema],
  instructions: [
    {
      type: String,
      required: true,
    },
  ],
  notes: [
    {
      type: String,
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approved: {
    type: Boolean,
    required: true,
    default: false,
  },
});

RecipeSchema.pre('remove', async function (next) {
  try {
    const recipeId = this._id;
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

module.exports = mongoose.model('Recipe', RecipeSchema);
