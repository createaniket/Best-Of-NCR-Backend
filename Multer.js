const Multer = require("multer");



var Storage1 =  Multer.memoryStorage();


module.exports = {
  upload_Category: Multer({ storage: Storage1 }),
};