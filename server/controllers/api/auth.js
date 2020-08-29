const User = require('../../models/User');
const Member = require('../../models/Member');
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
        const {username, password, remember} = req.body;

        let condition = {username: username};
        if (isEmailAddress(username)) {
            condition = {email: username};
        }

        User.findOne(condition).select('_id name username email password avatar status preferences tokens')
            .then(async user => {
                if (user) {
                    if (user.status === 'ACTIVATED') {
                        const member = await Member.findOne({userId: user._id});
                        bcrypt.compare(password, user.password)
                            .then(matchedPassword => {
                                if(matchedPassword) {
                                    const token = jwt.sign({
                                        email: user.email,
                                        userId: user._id.toString()
                                    }, process.env.JWT_TOKEN_SECRET, {expiresIn: 300});
                                    const refreshToken = crypto.randomBytes(32).toString('hex');
                                    const rememberToken = crypto.randomBytes(32).toString('hex');

                                    // generate tokens
                                    user.tokens.push({
                                        type: 'ACCESS_TOKEN',
                                        token: token,
                                        expiredAt: moment().add(5, 'minutes')
                                    });
                                    user.tokens.push({
                                        type: 'REFRESH_TOKEN',
                                        token: refreshToken,
                                        expiredAt: moment().add((remember ? 60 : 43200), 'minutes')
                                    });
                                    if (remember) {
                                        user.tokens.push({
                                            type: 'REMEMBER',
                                            token: rememberToken,
                                            expiredAt: moment().add(30, 'days')
                                        });
                                    }
                                    user.save();

                                    // send cookie header
                                    res.cookie('token', token, {
                                        expires: new Date(Date.now() + (5 * 60 * 1000)), // 5 minutes
                                        secure: false, // set to true if your using https
                                        httpOnly: true,
                                    });
                                    res.cookie('refreshToken', refreshToken, {
                                        expires: new Date(Date.now() + ((remember ? 60 : 43200) * 60 * 1000)), // 60 minutes or 30 days if remember
                                        secure: false,
                                        httpOnly: true,
                                    });

                                    if (remember) {
                                        res.cookie('remember', rememberToken, {
                                            expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
                                            secure: false,
                                            httpOnly: true,
                                        });
                                    }

                                    res.json({
                                        status: 'success',
                                        message: 'You are successfully logged in',
                                        payload: {
                                            //refreshToken: refreshToken, we store refresh token in httpOnly cookie
                                            token: token,
                                            user: {
                                                _id: user.id,
                                                name: user.name,
                                                username: user.username,
                                                email: user.email,
                                                status: user.status,
                                                avatar: res.locals._baseUrl + user.avatar.replace(/\\/g, "/"),
                                                preferences: user.preferences,
                                                member: member
                                            },
                                        }
                                    });

                                } else {
                                    res.json({status: 'error', message: 'Invalid credentials, try again!'});
                                }
                            })
                            .catch(err => next(createError(500, err)));
                    } else {
                        res.json({status: 'error', message: `Your account is ${user.status || 'PENDING'}`});
                    }
                } else {
                    res.json({status: 'error', message: `User ${username} not found`});
                }
            })
            .catch((err) => {
                next(createError(500, err));
            });
    },
    logout: (req, res) => {
        res.cookie('token', {expires: Date.now()});
        res.cookie('refreshToken', {expires: Date.now()});
        res.cookie('remember', {expires: Date.now()});
        res.sendStatus(200);
    },
    token: async (req, res) => {
        const email = req.body.email;
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        const user = await User.findOne({email: email});
        const refreshTokenData = user.tokens.find(token => token.type === 'REFRESH_TOKEN' && token.token === refreshToken);
        if (refreshTokenData) {
            if (refreshTokenData.expiredAt > new Date()) {
                // create new token
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id.toString()
                }, process.env.JWT_TOKEN_SECRET, {expiresIn: 300});

                // extend refresh token expired time
                user.tokens = user.tokens.map(tokenItem => {
                    if (tokenItem.type === 'REFRESH_TOKEN' && tokenItem.token === refreshToken) {
                        return {...tokenItem._doc, expiredAt: moment().add(60, 'minutes')}
                    }
                    return tokenItem;
                });

                // push new token
                user.tokens.push({
                    type: 'ACCESS_TOKEN',
                    token: token,
                    expiredAt: moment().add(5, 'minutes')
                });
                user.save();

                // send cookie token
                res.cookie('token', token, {
                    expires: new Date(Date.now() + (5 * 60 * 1000)),
                    secure: false, // set to true if your using https
                    httpOnly: true,
                });
                res.cookie('refreshToken', refreshToken, {
                    expires: new Date(Date.now() + (60 * 60 * 1000)), // 60 minutes
                    secure: false,
                    httpOnly: true,
                });

                res.json({token: token});
            } else {
                // refresh token expired and remove expired token from list
                user.tokens = user.tokens.filter(token => {
                    return token.expiredAt < new Date();
                });
                user.save();

                res.sendStatus(401);
            }
        }
        else {
            res.sendStatus(401);
        }
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
                    url: `/user/view/${user._id}`
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
                next(createError(500, err));
            });
    },
    sendEmailRecovery: async (req, res) => {
        const {email, url} = req.body;

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
                    html: ejs.compile(fs.readFileSync(path.join(__dirname, '..', '..', 'views', 'emails', 'reset-password.ejs'), 'utf8'))({
                        url: url || `${req.protocol}://${req.get('host')}`,
                        resetUrl: (url || `${req.protocol}://${req.get('host')}/auth/reset-password`) + `/${generatedToken}?email=${email}`,
                        user: user,
                    })
                };

                sendMail(mailOptions, function (err, info) {
                    res.json({status: 'success', message: 'We already send you email to reset your password!'});
                });
            } else {
                res.json({status: 'error', message: `Email ${email} is not registered in our system`});
            }
        } catch (err) {
            next(createError(500, err));
        }
    },
    resetPassword: async (req, res) => {
        const token = req.params.token;
        const email = req.body.email;
        const password = req.body.password;

        try {
            const user = await User.findOne({email: email});
            if (user) {
                if (isValidResetToken(user.tokens, token) !== false) {
                    user.password = await bcrypt.hash(password, 12);
                    user.save();

                    res.json({status: 'success', message: `Your password is recovered`});
                } else {
                    res.json({status: 'error', message: `Token is invalid`});
                }
            } else {
                res.json({status: 'error', message: `User not found`});
            }
        } catch (err) {
            next(createError(500, err));
        }
    },
};
