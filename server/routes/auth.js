const express = require('express');
const router = express.Router();

const auth = require('../controllers/auth');
const redirectIfAuthenticated = require('../middleware/redirectIfAuthenticated');
const mustAuthenticated = require('../middleware/mustAuthenticated');

router.get('/', redirectIfAuthenticated, (req, res) => res.redirect('/auth/login'));
router.get('/login', redirectIfAuthenticated, auth.login);
router.post('/login', redirectIfAuthenticated, auth.authenticate);
router.get('/google/callback', redirectIfAuthenticated, auth.googleCallback);
router.get('/facebook/callback', redirectIfAuthenticated, auth.facebookCallback);
router.get('/register', redirectIfAuthenticated, auth.register);
router.post('/register', redirectIfAuthenticated, auth.saveRegistration);
router.get('/forgot-password', redirectIfAuthenticated, auth.forgotPassword);
router.post('/forgot-password', redirectIfAuthenticated, auth.sendEmailRecovery);
router.get('/reset-password/:token', redirectIfAuthenticated, auth.passwordRecovery);
router.put('/reset-password/:token', redirectIfAuthenticated, auth.resetPassword);
router.post('/logout', mustAuthenticated, auth.logout);

module.exports = router;
