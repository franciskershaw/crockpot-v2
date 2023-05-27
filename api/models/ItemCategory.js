const mongoose = require('mongoose');

const ItemCategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
		unique: true
  },
  faIcon: {
    type: String,
    required: true,
		unique: true
  },
});

module.exports = mongoose.model('ItemCategory', ItemCategorySchema);
