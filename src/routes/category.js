const express = require("express");
const router = new express.Router();

const { upload_Category } = require("../../Multer");

const {
  getCategory,
  getbyid,
  deleteCategory,
  AddCategoryMain,
  UpdateCategoryMain,
} = require("../controller/categorycontroller");

router.post("/add", upload_Category.single("catimg"), AddCategoryMain);

router.get("/get", getCategory);
router.get("/getone/:id", getbyid);
router.patch(
  "/edit/:id",
  upload_Category.single("catimg"),
  UpdateCategoryMain
);
router.delete("/delete/:id", deleteCategory);
// router.delete('/deleteall', ADAuth, deleteallcat)


module.exports = router;
