const User = require('../models/User');
const Log = require('../models/Log');
const {sendMail} = require('../helpers/mailer');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const moment = require("moment");

function isEmailAddress(value) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase())
}

function isValidResetToken(tokens, token) {
    let isFound = false;
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].token === token) {
            tokens.splice(i, 1);
            isFound = i;
        }
    }

    return isFound;
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
                if (user.status === 'ACTIVATED') {
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
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    userAgent: {
                        browser: req.useragent.browser,
                        version: req.useragent.version,
                        os: req.useragent.os,
                        platform: req.useragent.platform
                    },
                    data: loggedUser,
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
                req.io.emit('new-user', {
                    message: `User ${name} recently registered to our system, please review it`,
                    url: `/admin/user/view/${user._id}`
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
                    if (err) {
                        req.flash('warning', 'You are registered, but email failed to be sent!');
                        res.redirect('back');
                    } else {
                        req.flash('success', 'You are registered, check your email!');
                        res.redirect('/auth/login');
                    }
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
    sendEmailRecovery: async (req, res) => {
        const {email} = req.body;

        try {
            const user = await User.findOne({email: email});
            if (user) {
                const tokens = user.tokens || [];
                const generatedToken = crypto.randomBytes(32).toString('hex');
                tokens.push({
                    type: 'PASSWORD',
                    token: generatedToken,
                    expiredAt: moment().add(1, 'days')
                });

                user.tokens = tokens;
                user.save();

                const mailOptions = {
                    from: `${process.env.APP_NAME} <${process.env.MAIL_ADMIN}>`,
                    to: user.email,
                    subject: `${process.env.APP_NAME} - Reset Password`,
                    html: ejs.compile(fs.readFileSync(path.join(__dirname, '..', 'views', 'emails', 'reset-password.ejs'), 'utf8'))({
                        url: `${req.protocol}://${req.get('host')}`,
                        resetUrl: `${req.protocol}://${req.get('host')}/auth/reset-password/${generatedToken}?email=${email}`,
                        user: user,
                    })
                };

                sendMail(mailOptions, function (err, info) {
                    req.flash('success', 'We already send you email to reset your password!');
                    res.redirect('/auth/login');
                });
            } else {
                req.flash('old', req.body);
                req.flash('danger', `Email ${email} is not registered in our system`);
                res.redirect('back');
            }
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Send recovery email failed, try again later`);
            res.redirect('back');
        }
    },
    passwordRecovery: async (req, res) => {
        const token = req.params.token;
        const email = req.query.email;

        try {
            const user = await User.findOne({email: email});
            if (user) {
                if (isValidResetToken(user.tokens, token) !== false) {
                    res.render('auth/password-recovery', {title: 'Password Recovery', token, email});
                } else {
                    req.flash('danger', `Token is invalid`);
                    res.redirect('/auth/login');
                }
            } else {
                req.flash('danger', `User not found`);
                res.redirect('/auth/login');
            }
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Password recovery invalid, try again later`);
            res.redirect('/auth/login');
        }
    },
    resetPassword: async (req, res) => {
        const token = req.params.token;
        const email = req.query.email;
        const password = req.body.password;

        try {
            const user = await User.findOne({email: email});
            if (user) {
                if (isValidResetToken(user.tokens, token) !== false) {
                    user.password = await bcrypt.hash(password, 12);
                    user.save();

                    req.flash('success', `Your password is recovered`);
                    res.redirect('/auth/login');
                } else {
                    req.flash('danger', `Token is invalid`);
                    res.redirect('back');
                }
            } else {
                req.flash('danger', `User not found`);
                res.redirect('/auth/login');
            }
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Password recovery invalid, try again later`);
            res.redirect('/auth/login');
        }
    },
    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/auth/login');
        });
    },
};
