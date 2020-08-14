const User = require('../../models/User');
const Notification = require('../../models/Notification');
const Log = require('../../models/Log');
const {sendMail} = require('../../helpers/mailer');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const moment = require("moment");
const jwt = require("jsonwebtoken");

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
    login: async (req, res, next) => {
        const {username, password} = req.body;

        let condition = {username: username};
        if (isEmailAddress(username)) {
            condition = {email: username};
        }

        let foundUser;
        User.findOne(condition)
            .then(user => {
                if (user) {
                    if (user.status === 'ACTIVATED') {
                        bcrypt.compare(password, user.password)
                            .then(matchedPassword => {
                                if(matchedPassword) {
                                    Log.create({
                                        userId: user._id,
                                        type: 'Login',
                                        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                                        userAgent: {
                                            browser: req.useragent.browser,
                                            version: req.useragent.version,
                                            os: req.useragent.os,
                                            platform: req.useragent.platform
                                        },
                                        data: user,
                                        time: new Date(),
                                    });

                                    const token = jwt.sign({
                                        email: user.email,
                                        userId: user._id.toString()
                                    }, process.env.JWT_TOKEN_SECRET, {expiresIn: '1h'});

                                    res.json({
                                        status: 'success',
                                        message: 'You are successfully logged in',
                                        payload: {
                                            token: token,
                                            user: user
                                        }
                                    });
                                } else {
                                    res.json({status: 'error', message: 'Invalid credentials, try again!'});
                                }
                            });
                    } else {
                        res.json({status: 'error', message: `Your account is ${user.status || 'PENDING'}`});
                    }
                } else {
                    res.json({status: 'error', message: `User ${username} not found`});
                }
            })
            .catch((err) => {
                next(createError(err));
            });
    },
    register: (req, res, next) => {
        const {name, username, email, password} = req.body;

        bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({name, username, email, password: hashedPassword, status: 'ACTIVATED'});
                return user.save();
            })
            .then(user => {
                const notificationMessage = {
                    message: `User ${name} recently registered to our system`,
                    url: `/admin/user/view/${user._id}`
                };
                req.io.emit('new-user', notificationMessage);
                Notification.create({
                    userId: user._id,
                    channel: 'new-user',
                    ...notificationMessage,
                    createdAt: new Date(),
                });

                const mailOptions = {
                    from: `${process.env.APP_NAME} <${process.env.MAIL_ADMIN}>`,
                    to: user.email,
                    subject: `${process.env.APP_NAME} - Welcome aboard`,
                    html: ejs.compile(fs.readFileSync(path.join(__dirname, '..', '..', 'views', 'emails', 'basic.ejs'), 'utf8'))({
                        url: `${req.protocol}://${req.get('host')}`,
                        title: 'You Are Registered',
                        name: user.name,
                        email: user.email,
                        content: "<p>You're successfully registered, find your pleasure and start booking.</p>"
                    })
                };

                sendMail(mailOptions, function (err, info) {
                    if (err) {
                        res.json({status: 'success', message: 'You are registered, but email failed to be sent!'});
                    } else {
                        res.json({status: 'success', message: 'You are registered, check your email!'});
                    }
                });
            })
            .catch((err) => {
                next(createError(500));
            });
    },
};
