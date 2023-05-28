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
  recipeMenu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecipeMenu',
  },
  shoppingList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShoppingList',
  },
});

// middleware to remove deleted recipe from user's 'favouriteRecipes' and 'recipeMenu'
// UserSchema.pre('findOneAndDelete', async function (next) {
//   try {
//     const deletedRecipe = await this.findOne();
//     const recipeId = deletedRecipe._id;

//     // remove recipe id from user's 'favouriteRecipes'
//     await User.updateMany(
//       { favouriteRecipes: recipeId },
//       { $pull: { favouriteRecipes: recipeId } }
//     );

//     // remove recipe id from user's 'recipeMenu'
//     await User.updateMany(
//       { 'recipeMenu._id': recipeId },
//       { $pull: { recipeMenu: { _id: recipeId } } }
//     );

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = mongoose.model('User', UserSchema);
