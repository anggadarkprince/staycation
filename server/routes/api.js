const express = require('express');
const router = express.Router();

const landing = require('../controllers/api/landing');
const booking = require('../controllers/api/booking');
const auth = require('../controllers/api/auth');
const profile = require('../controllers/api/profile');
const { upload } = require('../middleware/multer');
const authApi  = require('../middleware/authAPI');

// public api
router.get('/landing', landing.index);
router.get('/detail/:id', landing.detail);
router.get('/facilities', landing.facilities);
router.get('/categories', landing.categories);
router.get('/explore', landing.explore);
router.get('/banks', landing.banks);
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/token', auth.token);
router.post('/logout', auth.logout);
router.post('/password/email', auth.sendEmailRecovery);
router.post('/password/reset/:token', auth.resetPassword);

// authenticated api
router.post('/booking', authApi, booking.save);
router.post('/booking/payment', authApi, upload.single("image"), booking.payment);
router.get('/booking/invoice/:id', authApi, booking.print);
router.get('/booking/:id', authApi, booking.view);
router.put('/booking/rate/:id', authApi, upload.single("image"), booking.rate);
router.get('/profile', authApi, profile.index);
router.post('/setting/basic', authApi, profile.basic);
router.post('/setting/notification', authApi, profile.notification);
router.post('/setting/password', authApi, profile.password);

module.exports = router;
