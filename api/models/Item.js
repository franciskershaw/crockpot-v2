const mongoose = require('mongoose');
const Recipe = require('./Recipe');
const User = require('./User');

const ItemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IngredientCategory',
    required: true,
  },
});

ItemSchema.pre('remove', async function (next) {
  try {
    const itemId = this._id;
    // Update any recipes and users that contain this item
    await Recipe.updateMany(
      { 'ingredients._id': itemId },
      { $pull: { ingredients: { _id: itemId } } }
    );

    await User.updateMany(
      { 'shoppingList._id': itemId },
      { $pull: { shoppingList: { _id: itemId } } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Item', ItemSchema);
