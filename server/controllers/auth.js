const User = require('../models/User');
const Notification = require('../models/Notification');
const Log = require('../models/Log');
const {sendMail} = require('../helpers/mailer');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require("crypto");
const moment = require("moment");
const OAuth2 = require('googleapis').google.auth.OAuth2;
const {OAuth2Client} = require('google-auth-library');
const queryString = require('query-string');
const axios = require('axios');

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
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const oauth2Client = new OAuth2(clientId, clientSecret, process.env.GOOGLE_CALLBACK);
        const googleLoginUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ]
        });

        const stringifiedParams = queryString.stringify({
            client_id: process.env.FACEBOOK_CLIENT_ID,
            redirect_uri: process.env.FACEBOOK_CALLBACK,
            scope: ['email'].join(','),
            response_type: 'code',
            auth_type: 'rerequest',
        });
        const facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;

        res.render('auth/login', {title: 'Login', googleLoginUrl, facebookLoginUrl});
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
                    req.session.userId = foundUser._id;
                    req.session.save();

                    Log.create({
                        userId: foundUser._id,
                        type: 'Login',
                        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                        userAgent: {
                            browser: req.useragent.browser,
                            version: req.useragent.version,
                            os: req.useragent.os,
                            platform: req.useragent.platform
                        },
                        data: foundUser,
                        time: new Date(),
                    });
                    res.redirect('/dashboard');
                } else {
                    req.flash('old', req.body);
                    req.flash('danger', 'Invalid credentials, try again!');
                    res.redirect('/auth/login');
                }
            })
            .catch((err) => {
                next(createError(500));
            });
    },
    googleCallback: (req, res) => {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const oauth2Client = new OAuth2(clientId, clientSecret, process.env.GOOGLE_CALLBACK);
        if (req.query.error) {
            req.flash('danger', 'You are not authorized to login with Google');
            return res.redirect('auth/login');
        } else {
            oauth2Client.getToken(req.query.code, async function (err, token) {
                if (err) {
                    req.flash('danger', 'Login with Google failed');
                    return res.redirect('auth/login');
                }

                const client = new OAuth2Client(clientId);
                const ticket = await client.verifyIdToken({
                    idToken: token['id_token'],
                    audience: clientId,
                });
                const payload = ticket.getPayload();

                let user = await User.findOne({email: payload.email});
                if (!user) {
                    const year = (new Date()).getFullYear().toString();
                    const month = ((new Date()).getMonth() + 1).toString();
                    const localPath = `uploads/${year}/${month}/${Date.now()}.jpg`;
                    const file = fs.createWriteStream(localPath);
                    const request = https.get(payload.picture, function (response) {
                        response.pipe(file);
                    });

                    user = new User({
                        name: payload.name,
                        username: payload.sub,
                        email: payload.email,
                        status: 'ACTIVATED',
                        avatar: path.join('/', localPath)
                    });
                    await user.save();
                }

                req.session.isLoggedIn = true;
                req.session.userId = user._id;
                req.session.save();

                res.redirect('/dashboard');
            });
        }
    },
    facebookCallback: async (req, res) => {
        try {
            const {data} = await axios({
                url: 'https://graph.facebook.com/v4.0/oauth/access_token',
                method: 'get',
                params: {
                    client_id: process.env.FACEBOOK_CLIENT_ID,
                    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
                    redirect_uri: process.env.FACEBOOK_CALLBACK,
                    code: req.query.code,
                },
            });

            const {data: facebookUser} = await axios({
                url: 'https://graph.facebook.com/me',
                method: 'get',
                params: {
                    fields: ['id', 'email', 'first_name', 'last_name', 'picture'].join(','),
                    access_token: data.access_token,
                },
            });

            let user = await User.findOne({email: facebookUser.email});
            if (!user) {
                const year = (new Date()).getFullYear().toString();
                const month = ((new Date()).getMonth() + 1).toString();
                const localPath = `uploads/${year}/${month}/${Date.now()}.jpg`;
                const file = fs.createWriteStream(localPath);
                https.get(facebookUser.picture.data.url, (response) => {
                    response.pipe(file);
                    file.on('finish', async () => {
                        user = new User({
                            name: facebookUser.first_name + ' ' + facebookUser.last_name,
                            username: facebookUser.id,
                            email: facebookUser.email,
                            status: 'ACTIVATED',
                            avatar: path.join('/', localPath)
                        });
                        await user.save();

                        req.session.isLoggedIn = true;
                        req.session.userId = user._id;
                        req.session.save();

                        res.redirect('/dashboard');
                    });
                });
            } else {
                req.session.isLoggedIn = true;
                req.session.userId = user._id;
                req.session.save();

                res.redirect('/dashboard');
            }
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Cannot login with facebook`);
            res.redirect('/auth/login');
        }
    },
    register: (req, res) => {
        if (req.settings.publicRegistration) {
            res.render('auth/register', {title: 'Register'});
        } else {
            req.flash('danger', 'Public registration is not allowed, please contact out administrator to acquire credentials!');
            res.redirect('/auth/login');
        }
    },
    saveRegistration: (req, res, next) => {
        const {name, username, email, password} = req.body;

        bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({name, username, email, password: hashedPassword, status: 'PENDING'});
                return user.save();
            })
            .then(user => {
                const notificationMessage = {
                    message: `User ${name} recently registered to our system, please review it`,
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
                    html: ejs.compile(fs.readFileSync(path.join(__dirname, '..', 'views', 'emails', 'basic.ejs'), 'utf8'))({
                        url: `${req.protocol}://${req.get('host')}`,
                        title: 'You Are Registered',
                        name: user.name,
                        email: user.email,
                        content: "<p>You're successfully registered, we will verify your data and contact you later. Please ignore this email if you think this is mistake.</p>"
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
