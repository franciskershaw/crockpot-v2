const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

const Item = require('../models/Item');

// Get all items
router.get('/', asyncHandler(async (req, res, next) => {
	try {
		const items = await Item.find().sort({ 'name': 1 })
		res.status(200).json(items)
	} catch (err) {
		next(err);
	}
}))

// Create a new item
router.post('/', isLoggedIn, isAdmin, asyncHandler(async (req, res, next) => {
	try {
		const item = new Item(req.body)
		await item.save()

		res.status(201).json(item)
	} catch (err) {
		next(err)
	}
}))

// Edit existing item
router.put('/:itemId', isLoggedIn, isAdmin, asyncHandler(async (req, res, next) => {
	try {
		const item = await Item.findByIdAndUpdate(req.params.itemId, req.body, {
			new: true,
		});
		res.status(200).json(item)
	} catch (err) {
		next(err);
	}
}))

// Delete an item
router.delete('/:itemId', isLoggedIn, isAdmin, asyncHandler(async (req, res, next) => {
	try {
		const item = await Item.findById(req.params.itemId)
		await item.remove()
		res.status(200).json({ msg: 'Item deleted'})
	} catch (err) {
		next(err)
	}
}))

module.exports = router;
