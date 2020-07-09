const express = require('express');
const router = express.Router();

const dashboard = require('../controllers/dashboard');
const roleRouter = require('./role');
const userRouter = require('./user');
const categoryRouter = require('./category');
const bankRouter = require('./bank');

const item = require('../controllers/item');
const booking = require('../controllers/booking');
const setting = require('../controllers/setting');
const account = require('../controllers/account');
const activityLog = require('../controllers/activity-log');

router.get('/', (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', dashboard.index);
router.use('/role', roleRouter);
router.use('/user', userRouter);
router.use('/category', categoryRouter);
router.use('/bank', bankRouter);

router.get('/item', item.index);
router.get('/booking', booking.index);
router.get('/settings', setting.index);
router.get('/account', account.index);
router.get('/activity-log', activityLog.index);

module.exports = router;
