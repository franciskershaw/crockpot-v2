const Recipe = require('../models/Recipe');

const jwt = require('jsonwebtoken');

const generateShoppingList = async (menu) => {
  let shoppingList = [];
  if (menu.length) {
    for (let object of menu) {
      const recipe = await Recipe.findById(object._id).select({
        ingredients: 1,
      });
      const ingredients = recipe.toObject().ingredients;
      let ingredientsFormated = ingredients.map((ingredient) => {
        return {
          ...ingredient,
          quantity: ingredient.quantity * object.serves,
          obtained: false,
        };
      });
      shoppingList = [
        ...shoppingList.filter(
          (obj) =>
            !ingredientsFormated.some(
              (newObj) => newObj._id.equals(obj._id) && newObj.unit === obj.unit
            )
        ),
        ...ingredientsFormated.map((obj) => {
          const originalObj = shoppingList.find(
            (originalObj) =>
              originalObj._id.equals(obj._id) && originalObj.unit === obj.unit
          );
          if (originalObj) {
            return {
              ...obj,
              quantity: originalObj.quantity + obj.quantity,
            };
          }
          return obj;
        }),
      ];
    }
  }
  return shoppingList;
};

const generateAccessToken = (id) => {
  return jwt.sign({ _id: id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ _id: id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateShoppingList,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
