const Shop = require('../models/Shop');
const cloudinary = require('../config/cloudinaryconfig');

exports.AddShop = async (req, res) => {
  try {
    const { name, location, contact, services } = req.body;

    // Upload up to 5 images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResponse = await cloudinary.uploader.upload(file.path, {
          folder: 'bestofncr/Shops',
        });
        images.push(uploadResponse.secure_url);
      }
    }

    const newShop = new Shop({
      name,
      location,
      contact,
      services,
      images,
    });

    const savedShop = await newShop.save();

    res.status(201).json({
      message: 'Shop added successfully!',
      shop: savedShop,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding shop', error: error.message });
  }
};

// Get all shops
exports.GetAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('services');
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shops', error: error.message });
  }
};

// Get shop by ID
exports.GetShopById = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id).populate('services');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shop', error: error.message });
  }
};

// Update shop by ID
exports.UpdateShopById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, contact, services } = req.body;

    // Handle image updates
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResponse = await cloudinary.uploader.upload(file.path, {
          folder: 'bestofncr/Shops',
        });
        images.push(uploadResponse.secure_url);
      }
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      id,
      { name, location, contact, services, images },
      { new: true }
    );

    if (!updatedShop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.status(200).json({
      message: 'Shop updated successfully!',
      shop: updatedShop,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shop', error: error.message });
  }
};

// Delete shop by ID
exports.DeleteShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedShop = await Shop.findByIdAndDelete(id);
    if (!deletedShop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.status(200).json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shop', error: error.message });
  }
};
