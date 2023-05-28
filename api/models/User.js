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
  favouriteRecipes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    required: true,
  },
  recipeMenu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecipeMenu',
  },
  shoppingList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShoppingList',
  },
});

module.exports = mongoose.model('User', UserSchema);
