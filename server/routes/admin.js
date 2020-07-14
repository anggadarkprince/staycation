const express = require('express');
const router = express.Router();

const dashboard = require('../controllers/dashboard');
const roleRouter = require('./role');
const userRouter = require('./user');
const categoryRouter = require('./category');
const bankRouter = require('./bank');
const itemRouter = require('./item');
const accountRouter = require('./account');
const logRouter = require('./log');

const booking = require('../controllers/booking');
const setting = require('../controllers/setting');

router.get('/', (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', dashboard.index);
router.use('/role', roleRouter);
router.use('/user', userRouter);
router.use('/category', categoryRouter);
router.use('/bank', bankRouter);
router.use('/item', itemRouter);
router.use('/account', accountRouter);
router.use('/activity-log', logRouter);

router.get('/booking', booking.index);
router.get('/settings', setting.index);

module.exports = router;
