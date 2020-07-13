const User = require('../models/User');
const Log = require('../models/Log');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');

function isEmailAddress(value) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase())
}

module.exports = {
    login: (req, res) => {
        res.render('auth/login', {title: 'Login'});
    },
    authenticate: async (req, res, next) => {
        const {username, password} = req.body;

        let condition = {username: username};
        if (isEmailAddress(username)) {
            condition = {email: username};
        }

        let foundUser;
        User.findOne(condition).then(user => {
            if (user) {
                foundUser = user;
                return bcrypt.compare(password, user.password);
            } else {
                req.flash('danger', `User ${username} not found`);
                res.redirect('/auth/login');
            }
        })
            .then(matchedPassword => {
                if (matchedPassword) {
                    req.session.isLoggedIn = true;
                    req.session.userId = foundUser.id;
                    req.session.save();

                    return foundUser;
                } else {
                    req.flash('danger', 'Invalid credentials, try again!');
                    res.redirect('/auth/login');
                }
            })
            .then(loggedUser => {
                Log.create({
                    userId: loggedUser._id,
                    type: 'Login',
                    data: JSON.stringify(loggedUser),
                    time: new Date(),
                });
                res.redirect('/admin/dashboard');
            })
            .catch((err) => {
                next(createError(500));
            });
    },
    register: (req, res) => {
        res.render('auth/register', {title: 'Register'});
    },
    saveRegistration: (req, res) => {
    },
    forgotPassword: (req, res) => {
        res.render('auth/forgot-password', {title: 'Forgot Password'});
    },
    sendEmailRecovery: (req, res) => {
    },
    passwordRecovery: (req, res) => {
        res.render('auth/password-recovery', {title: 'Password Recovery'});
    },
    resetPassword: (req, res) => {
    },
    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/auth/login');
        });
    },
};