const express = require('express');
const router = express.Router();

const landing = require('../controllers/api/landing');
const booking = require('../controllers/api/booking');
const { upload } = require('../middleware/multer');

router.get('/landing', landing.index);
router.get('/detail/:id', landing.detail);
router.post('/booking', upload.single("image"), booking.save);

module.exports = router;
