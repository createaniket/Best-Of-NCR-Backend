const Service = require('../models/Service');
const cloudinary = require('../mycnfg/cloudinaryconfig'); // Cloudinary configuration

// Add a new service
exports.addService = async (req, res) => {
  console.log("in add service")
  try {
    const { name, category, description } = req.body;

    let imageUrl = null;

    // Handle image upload
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'bestofncr/Services' }, // Cloudinary folder
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    const newService = new Service({
      name,
      category,
      description,
      image: imageUrl,
    });

    const savedService = await newService.save();
    res.status(201).json({
      message: 'Service added successfully!',
      service: savedService,
    });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ message: 'Failed to add service.', error: error.message });
  }
};


// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('category', 'name'); // Populate category details
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services.', error: error.message });
  }
};


// Get a service by ID
exports.getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId).populate('category', 'name').populate('shops', 'name location');
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Failed to fetch service.', error: error.message });
  }
};


// Update a service
exports.updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, category, description } = req.body;

    let imageUrl = null;

    // Handle image upload if a new image is provided
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'bestofncr/Services' }, // Cloudinary folder
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        name,
        category,
        description,
        ...(imageUrl && { image: imageUrl }), // Only update image if provided
      },
      { new: true } // Return the updated document
    );

    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    res.status(200).json({
      message: 'Service updated successfully!',
      service: updatedService,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Failed to update service.', error: error.message });
  }
};


// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const deletedService = await Service.findByIdAndDelete(serviceId);
    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Failed to delete service.', error: error.message });
  }
};
