const Shop = require('../models/Shop');
const cloudinary = require('../mycnfg/cloudinaryconfig');
const axios = require('axios');

exports.AddShop = async (req, res) => {
  try {
    const { name, location, contact, services } = req.body;

    console.log('Request Body:', req.body);
    console.log('Uploaded Files:', req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const images = [];
    for (const file of req.files) {
      console.log('Processing file:', file.originalname);

      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'bestofncr/Shops' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(file.buffer);
      });

      images.push(uploadResponse.secure_url);
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
    console.error('Error:', error.message);
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
  console.log("i ah hit by the get by id",req.params)
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


exports.AddVote = async (req, res) => {

  console.log("i ma the shppiod", req.params)
  const shopId = req.params.id;

  try {
    // Find the shop by ID
    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Check if the user has already voted
    const hasVoted = shop.votes.some(vote => vote.user.toString() === req.user._id.toString());
    if (hasVoted) {
      return res.status(400).json({ message: 'User has already voted for this shop' });
    }

    // Add the user's vote
    shop.votes.push({ user: req.user._id });

    // Save the shop
    const result = await shop.save();

    res.status(200).json({ message: 'Shop vote casted successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Error casting vote for shop', error: error.message });
  }
};


exports.GetFulUrl = async(req, res) => {
  console.log("i have been hit here now hor hshs");

    try {
        const { shortUrl } = req.query; // Pass the short URL as a query param
        console.log("The shortened URL:", shortUrl);

        // Make a request with redirection handling disabled
        const response = await axios.get(shortUrl, {
            maxRedirects: 0, // Prevent automatic following of redirects
            validateStatus: (status) => status === 302, // Capture redirection responses only
        });

        const fullUrl = response.headers.location; // Extract the full URL from the location header
        console.log("The full URL here:", fullUrl);

        res.json({ fullUrl });
    } catch (error) {
        console.error("Error while expanding URL:", error.message || error);
        res.status(500).json({ error: 'Error expanding URL' });
    }
}