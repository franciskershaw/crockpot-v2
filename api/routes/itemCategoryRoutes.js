const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware')

const ItemCategory = require('../models/ItemCategory')

// Get all categories (for adding recipe page)
router.get('/', asyncHandler(async (req, res, next) => {
	try {
		const itemCategories = await ItemCategory.find()
		res.status(200).json(itemCategories)
	} catch (err) {
		next(err)
	}
}))

// Create a new item category
router.post('/', isLoggedIn, isAdmin, asyncHandler(async (req, res, next) => {
	try {
		const itemCategory = new ItemCategory(req.body);
		await itemCategory.save()

		res.status(201).json(ItemCategory)
	} catch (err) {
		next(err)
	}
}))

// Edit existing recipe category
router.put('/:itemCategoryId', isLoggedIn, isAdmin, asyncHandler(async (req, res, next) => {
	try {
		const itemCategory = await ItemCategory.findByIdAndUpdate(req.params.itemCategoryId, req.body, {
			new: true,
		});
		res.status(200).json(itemCategory)
	} catch (err) {
		next(err);
	}
}))

module.exports = router;
