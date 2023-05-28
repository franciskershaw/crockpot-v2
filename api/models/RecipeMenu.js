const mongoose = require('mongoose');

const RecipeMenuSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipes: [
    {
      recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true,
      },
      serves: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('RecipeMenu', RecipeMenuSchema);
