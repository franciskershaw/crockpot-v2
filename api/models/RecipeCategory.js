const mongoose = require('mongoose');
const Recipe = require('./Recipe');

const RecipeCategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

RecipeCategorySchema.pre('remove', async function (next) {
  try {
    const recipeCategoryId = this._id;
    // Update any recipes that contain this category
    await Recipe.updateMany(
      { categories: recipeCategoryId },
      { $pull: { categories: recipeCategoryId } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('RecipeCategory', RecipeCategorySchema);
