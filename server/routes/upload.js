const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload');
const {uploadTemp} = require('../middleware/multer');

/* GET home page. */
router.post('/upload-temp', uploadTemp.single("input_files"), uploadController.uploadTemp);
router.delete('/delete-temp', uploadController.deleteTemp);

module.exports = router;
