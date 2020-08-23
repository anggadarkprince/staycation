const express = require('express');
const router = express.Router();

const landing = require('../controllers/api/landing');
const booking = require('../controllers/api/booking');
const auth = require('../controllers/api/auth');
const profile = require('../controllers/api/profile');
const { upload } = require('../middleware/multer');
const authApi  = require('../middleware/authAPI');

router.get('/landing', landing.index);
router.get('/detail/:id', landing.detail);
router.get('/booking/invoice/:id', booking.print);
router.post('/booking', upload.single("image"), booking.save);
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/token', auth.token);
router.post('/logout', auth.logout);
router.post('/password/email', auth.sendEmailRecovery);
router.post('/password/reset/:token', auth.resetPassword);
router.get('/profile', authApi, profile.index);
router.post('/setting/basic', authApi, profile.basic);
router.post('/setting/notification', authApi, profile.notification);
router.post('/setting/password', authApi, profile.password);

module.exports = router;
