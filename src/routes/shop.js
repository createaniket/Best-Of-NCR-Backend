const express = require('express');
const router = express.Router();
const ShopController = require('../controller/shopcontroller');
const multer = require('multer');
// Multer configuration for single file upload
const storage = multer.memoryStorage(); // Store file in memory for direct Cloudinary upload
const upload = multer({ storage });

// Add a new shop (with up to 5 images)
router.post('/add', upload.array('images', 5), ShopController.AddShop);

// Get all shops
router.get('/all', ShopController.GetAllShops);

// Get a specific shop by ID
router.get('/:id', ShopController.GetShopById);

// Update a shop by ID (with up to 5 new images)
router.put('/update/:id', upload.array('images', 5), ShopController.UpdateShopById);

// Delete a shop by ID
router.delete('/delete/:id', ShopController.DeleteShopById);

module.exports = router;