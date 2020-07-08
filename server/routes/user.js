const express = require('express');
const router = express.Router();
const user = require('../controllers/user');

router.get('/', user.index);
router.get('/create', user.create);
router.post('/save', user.save);

module.exports = router;
