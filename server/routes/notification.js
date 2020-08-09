const express = require('express');
const router = express.Router();
const notification = require('../controllers/notification');

router.get('/', notification.index);
router.get('/read/:id', notification.read);
router.get('/read-all', notification.readAll);

module.exports = router;
