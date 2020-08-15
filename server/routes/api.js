const express = require('express');
const router = express.Router();

const landing = require('../controllers/api/landing');
const booking = require('../controllers/api/booking');
const auth = require('../controllers/api/auth');
const { upload } = require('../middleware/multer');
const authApi  = require('../middleware/authAPI');

router.get('/landing', landing.index);
router.get('/detail/:id', landing.detail);
router.post('/booking', upload.single("image"), booking.save);
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/token', auth.token);
router.post('/password/email', auth.sendEmailRecovery);
router.post('/password/reset/:token', auth.resetPassword);
router.get('/profile', authApi, (req, res, next) => {
    res.json({user: {...req.user._doc, avatar: res.locals._baseUrl + req.user.avatar.replace(/\\/g, "/")}});
});

module.exports = router;
