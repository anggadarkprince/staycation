const express = require('express');
const router = express.Router();
const setting = require('../controllers/setting');

router.get('/', setting.index);
router.put('/', setting.update);

module.exports = router;
