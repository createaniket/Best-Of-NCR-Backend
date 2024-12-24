const Category = require("../models/Category");
const fs = require('fs');
const cloudinary = require('../config/cloudinaryconfig');


exports.AddCategoryMain = async (req, res) => {
  try {
    console.log("AddCategoryMain called");
    let categoryImg = null;

    // Upload image to Cloudinary
    if (req.file) {
      try {
        categoryImg = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "bestofncr/Categories" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          stream.end(req.file.buffer);
        });
      } catch (error) {
        return res.status(500).json({ message: "Error uploading image", error });
      }
    }

    const { name, slug, parent, isParent } = req.body;
    const isParentBoolean = isParent === 'true';

    if (isParentBoolean) {
      // Handle parent category creation
      const newCategory = new Category({
        isParent: true,
        name,
        slug,
        image: categoryImg,
      });

      const result = await newCategory.save();
      return res.status(201).json({
        message: "New top-level category has been added",
        result,
      });
    } else {
      // Handle child category creation
      const foundParentCategory = await Category.findById(parent);
      if (!foundParentCategory) {
        return res.status(404).json({ message: "Parent category not found" });
      }

      const newCategory = new Category({
        isParent: false,
        name,
        slug,
        parent,
        image: categoryImg,
      });

      const result = await newCategory.save();

      // Add child reference to parent
      foundParentCategory.Childrens.push(result._id);
      await foundParentCategory.save();

      return res.status(201).json({
        message: "New child category has been added successfully",
        result,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};





exports.UpdateCategoryMain = async (req, res) => {
  try {
    const ID = req.params.id;

    // Find the category by ID
    const category = await Category.findById(ID);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Extract public ID from the old image URL
    const oldImageUrl = category.image;
    let oldImagePublicId = null;
    if (oldImageUrl) {
      const urlSegments = oldImageUrl.split('/');
      oldImagePublicId = urlSegments[urlSegments.length - 1].split('.')[0];
    }

    // Determine the image to use
    let categoryImg = oldImageUrl; // Default to old image URL
    if (req.file) {
      // Upload new image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "Categories",
          },
          (error, result) => {
            if (result) {
              resolve(result); // Resolve with the upload result
            } else {
              reject(error); // Reject in case of an error
            }
          }
        );
        stream.end(req.file.buffer);
      });
      categoryImg = result.secure_url;
      
      // Delete the old image from Cloudinary if it exists
      if (oldImagePublicId) {
        await cloudinary.uploader.destroy(oldImagePublicId);
      }
    }

    // Update the category
    const { name, slug, parent, isParent } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(ID, {
      name,
      slug,
      isParent: isParent === "true",
      image: categoryImg,
      parent: isParent === "true" ? parent : undefined,
    }, { new: true });

    if (isParent === "true" && parent) {
      const parentCategory = await Category.findById(parent);
      if (parentCategory) {
        parentCategory.children.push(updatedCategory._id);
        await parentCategory.save();
      }
    }

    res.status(200).json({
      message: "Category has been updated successfully",
      result: updatedCategory,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};



exports.getCategory = async (req, res) => {
  try {
    const getCategory = await Category.find({}).populate("Childrens");
    if (getCategory) {
      return res.status(200).json({ categories: getCategory });
    } else {
      res.status(400).send("something bad happened");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
};

exports.getbyid = async (req, res) => {
  try {
    const getCategory = await Category.find({ _id: req.params.id });
    return res.status(200).json(getCategory);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
};



exports.deleteCategory = async (req, res) => {
  try {
    // Find the category by ID and get its details including the image path
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    const imageUrl = category.image; // Assuming `image` is the field storing the image URL
    let imagePublicId = null;

    console.log("Category image URL:", imageUrl);

    // Extract the public ID from the image URL
    if (imageUrl) {
      const urlSegments = imageUrl.split('/');
      imagePublicId = urlSegments[urlSegments.length - 3] + '/' + urlSegments[urlSegments.length - 2] + '/' + urlSegments[urlSegments.length - 1].split('.')[0];

      console.log("Extracted Image Public ID:", imagePublicId);
    }

    // Delete the category
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    // If the category had an associated image, delete the image from Cloudinary
    if (imagePublicId) {
      console.log("Deleting image with public ID:", imagePublicId);
      await cloudinary.uploader.destroy(imagePublicId, (error, result) => {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
        } else {
          console.log("Cloudinary delete result:", result);
        }
      });
    }

    return res.status(200).json({ msg: "Category deleted successfully", data: deletedCategory });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
};


  // exports.deleteallcat = async (req, res) => {
  //   try {
  //     // Retrieve all categories
  //     const categories = await Category.find({});
  
  //     // Iterate through each category
  //     for (const category of categories) {
  //       // Delete the category
  //       const result = await Category.findByIdAndDelete(category._id);
  //       if (!result) {
  //         console.log(`Category with id ${category._id} not found`);
  //         continue;
  //       }
  
  //       // If the category had an associated image, delete the image file from the file system
  //       if (category.image) {
  //         const imagePath = category.image;
  //         fs.unlinkSync(imagePath);
  //       }
  //     }
  
  //     res.status(200).send("All categories and their images deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting categories and images:", error);
  //     res.status(500).send(error);
  //   }
  // };



  