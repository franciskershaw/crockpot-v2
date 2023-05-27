const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

const RecipeCategory = require('../models/RecipeCategory')

// Get all recipe categories
router.get('/', asyncHandler(async (req, res, next) => {
	try {
		const recipeCategories = await RecipeCategory.find()
		res.status(200).json(recipeCategories);
	} catch (err) {
		next(err)
	}
}))

// Create a new recipe category
router.post('/', isLoggedIn, isAdmin, asyncHandler(async (req, res, next) => {
	try {
		const recipeCategory = new RecipeCategory(req.body);
		await recipeCategory.save()

		res.status(201).json(recipeCategory)
	} catch (err) {
		next(err)
	}
}))

// Edit existing recipe category
router.put('/:recipeCategoryId', isLoggedIn, isAdmin, asyncHandler(async (req, res, next) => {
	try {
		const recipeCategory = await RecipeCategory.findByIdAndUpdate(req.params.recipeCategoryId, req.body, {
			new: true,
		});
		res.status(200).json(recipeCategory)
	} catch (err) {
		next(err);
	}
}))

// Delete recipe category
router.delete('/:recipeCategoryId', isLoggedIn, isAdmin, asyncHandler(async (req, res, next) => {
	try {
		const recipeCategory = await RecipeCategory.findById(req.params.recipeCategoryId)
		await recipeCategory.remove()
		res.status(200).json({ msg: 'Recipe category deleted'})
	} catch (err) {
		next(err)
	}
}))

module.exports = router;