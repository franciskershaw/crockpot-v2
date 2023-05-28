const mongoose = require('mongoose');

const ItemSchema = {
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
};

const ShoppingListSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemsFromRecipeMenu: [ItemSchema],
  regularItems: [ItemSchema],
  extraItems: [ItemSchema],
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
