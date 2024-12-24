const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const serviceController = require('../controller/servicecontroller');

// Multer configuration for single file upload
const storage = multer.memoryStorage(); // Store file in memory for direct Cloudinary upload
const upload = multer({ storage });

// Routes
// Add a new service
router.post('/', upload.single('image'), serviceController.addService);

// Get all services
router.get('/', serviceController.getAllServices);

// Get a single service by ID
router.get('/:serviceId', serviceController.getServiceById);

// Update a service
router.put('/:serviceId', upload.single('image'), serviceController.updateService);

// Delete a service
router.delete('/:serviceId', serviceController.deleteService);

module.exports = router;
