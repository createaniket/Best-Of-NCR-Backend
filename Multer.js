const Multer = require("multer");



var Storage1 =  Multer.memoryStorage();


var Storage2 =  Multer.memoryStorage();


module.exports = {
  upload_Category: Multer({ storage: Storage1 }),
  upload_Shop: Multer({ storage: Storage2 }),

};