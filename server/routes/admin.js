const express = require('express');
const router = express.Router();

const dashboard = require('../controllers/dashboard');
const roleRouter = require('./role');
const userRouter = require('./user');
const categoryRouter = require('./category');
const bankRouter = require('./bank');
const facilityRouter = require('./facility');
const itemRouter = require('./item');
const bookingRouter = require('./booking');
const accountRouter = require('./account');
const settingRouter = require('./setting');
const logRouter = require('./log');
const notificationRouter = require('./notification');
const uploadRouter = require('./upload');

router.get('/', (req, res) => res.redirect('/dashboard'));
router.get('/dashboard', dashboard.index);
router.get('/search', dashboard.search);
router.use('/role', roleRouter);
router.use('/user', userRouter);
router.use('/category', categoryRouter);
router.use('/facility', facilityRouter);
router.use('/bank', bankRouter);
router.use('/item', itemRouter);
router.use('/booking', bookingRouter);
router.use('/account', accountRouter);
router.use('/settings', settingRouter);
router.use('/activity-log', logRouter);
router.use('/notification', notificationRouter);
router.use('/upload', uploadRouter);

module.exports = router;
