const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboard');
const role = require('../controllers/role');
const user = require('../controllers/user');
const category = require('../controllers/category');
const bank = require('../controllers/bank');
const item = require('../controllers/item');
const booking = require('../controllers/booking');

router.get('/', (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', dashboard.index);
router.get('/role', role.index);
router.get('/user', user.index);
router.get('/category', category.index);
router.get('/bank', bank.index);
router.get('/item', item.index);
router.get('/booking', booking.index);

module.exports = router;
