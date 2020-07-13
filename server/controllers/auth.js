const User = require('../models/User');
const Log = require('../models/Log');
const {sendMail} = require('../helpers/mailer');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

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
        User.findOne(condition)
            .then(user => {
                if (user) {
                    return foundUser = user;
                } else {
                    req.flash('danger', `User ${username} not found`);
                    res.redirect('/auth/login');
                }
            })
            .then(user => {
                if(user.status === 'ACTIVATED') {
                    return bcrypt.compare(password, user.password);
                } else {
                    req.flash('warning', `Your account is ${user.status || 'PENDING'}`);
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
    saveRegistration: (req, res, next) => {
        const {name, username, email, password} = req.body;

        bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({name, username, email, password: hashedPassword, status: 'PENDING'});
                return user.save();
            })
            .then(user => {
                console.log({
                    host: process.env.MAIL_HOST,
                    port: process.env.MAIL_PORT,
                    auth: {
                        user: process.env.MAIL_USERNAME,
                        pass: process.env.MAIL_PASSWORD
                    }
                });

                const mailOptions = {
                    from: `${process.env.APP_NAME} <${process.env.MAIL_ADMIN}>`,
                    to: user.email,
                    subject: `${process.env.APP_NAME} - Welcome aboard`,
                    html: ejs.compile(fs.readFileSync(path.join(__dirname, '..', 'views', 'emails', 'basic.ejs'), 'utf8'))({
                        url: `${req.protocol}://${req.get('host')}`,
                        title: 'You Are Registered',
                        name: user.name,
                        email: user.email,
                        content: "<p>You're successfully registered, we will verify your data and contact you later</p>"
                    })
                };

                sendMail(mailOptions, function (err, info) {
                    req.flash('success', 'You are registered, check your email!');
                    res.redirect('/auth/login');
                });
            })
            .catch((err) => {
                console.log(err);
                next(createError(500));
            });
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