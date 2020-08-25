require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const ioSession = require('socket.io-express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const MongoDBStore = require('connect-mongodb-session')(session);
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const compression = require('compression');
const cors = require('cors');
const errorhandler = require('errorhandler');
const winston = require('winston');
const favicon = require('serve-favicon');
const moment = require('moment');
const useragent = require('express-useragent');
const helmet = require('helmet');
const {Seeder} = require('mongo-seeding');
const {numberFormat, validationError} = require('./helpers/formatter');

const seeder = new Seeder({
    database: process.env.MONGO_URI,
    dropDatabase: false,
    dropCollections: true,
});
const collections = seeder.readCollectionsFromPath(
    path.resolve("./seed"),
    {transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId]}
);
seeder.import(collections)
    .then(() => {
        console.log('Seed database is completed');
    })
    .catch(console.log);

//mongoose.set('debug', true);
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Database initialized');
    })
    .catch(console.log);
mongoose.Promise = Promise;

const app = express();
app.use(favicon(path.join(__dirname, 'public', 'dist/img/favicon.png')));
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/theme', express.static(path.join(__dirname, 'node_modules', 'startbootstrap-sb-admin-2')));
app.use(useragent.express());
const sessionDriver = session({
    secret: 'secret98sh968sdf7s8df6',
    resave: false,
    saveUninitialized: true,
    store: new MongoDBStore({
        uri: process.env.MONGO_URI,
        collection: 'sessions'
    }),
    cookie: { secure: false } // set to true if your using https
});
app.use(sessionDriver);
app.use(flash());
app.use(compression());
app.use(cors({
    origin: [process.env.APP_URL, process.env.APP_FIRST_PARTY_URL],
    optionsSuccessStatus: 200,
    credentials: true
}));

// io socket for push notification
const server = http.createServer(app);
const io = require('socket.io')(server);
io.use(ioSession(sessionDriver));
app.use((req, res, next) => {
    req.io = io;
    return next();
});
const socketConnections = {};
io.on('connection', function (socket) {
    socketConnections[socket.handshake.session.userId] = socket.id;
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('new-booking', function (msg) {
        console.log('booking message: ' + msg);
        io.emit('new-booking', msg);
    });
    socket.on('new-user', function (msg) {
        console.log('user message: ' + msg);
        io.emit('new-user', msg);
    });
});
app.use((req, res, next) => {
    req.socketConnections = socketConnections;
    return next();
});

const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
    app.use(errorhandler());
}

const loggerWinston = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    loggerWinston.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

const Notification = require('./models/Notification');
const Setting = require('./models/Setting');
const User = require('./models/User');
const Auth = require('./modules/Auth');
const permissions = require('./config/permissions');

// populate user data to request and local data
app.use((req, res, next) => {
    if (!req.session.userId) {
        req.user = {};
        req.session.permissions = {};
        res.locals._loggedUser = {};
        return next();
    }
    User.findById(req.session.userId)
        .then(user => {
            req.user = user;
            res.locals._loggedUser = user;
            const permissionReq = Auth.getPermissions(req.user._id);
            const notificationReq = Notification.find({userId: req.user._id, isRead: false}).sort([['createdAt', -1]]).limit(5);
            const notificationUnreadTotal = Notification.countDocuments({userId: req.user._id, isRead: false});
            Promise.all([permissionReq, notificationReq, notificationUnreadTotal])
                .then(result => {
                    const permissions = result[0];
                    const notifications = result[1];
                    const notificationUnreadTotal = result[2];
                    req.session.permissions = permissions;
                    res.locals._unreadNotifications = notifications;
                    res.locals._unreadNotificationTotal = notificationUnreadTotal || 0;
                    next();
                })
                .catch(console.log);
        })
        .catch(console.log);
});

// add app setting to request and local view
app.use(async (req, res, next) => {
    const systemSetting = {
        appName: (await Setting.findOne({key: 'app-name'})).value || process.env.APP_NAME,
        contact: (await Setting.findOne({key: 'contact'})).value || '',
        email: (await Setting.findOne({key: 'email'})).value || process.env.MAIL_ADMIN,
        address: (await Setting.findOne({key: 'address'})).value || '',
        currencySymbol: (await Setting.findOne({key: 'currency-symbol'})).value || '',
        taxPercent: (await Setting.findOne({key: 'tax-percent'})).value || 10,
        publicRegistration: (await Setting.findOne({key: 'public-registration'})).value || 0,
    };
    res.req.settings = systemSetting;
    res.locals._settings = systemSetting;
    next();
});

// add general variable and helper to the view
app.use((req, res, next) => {
    res.locals._baseUrl = `${req.protocol}://${req.get('host')}`;
    res.locals._path = req.path;
    res.locals._query = req._parsedUrl.query || '';
    res.locals._currentUrl = `${res.locals._baseUrl}${res.locals._path}`;
    res.locals._currentFullUrl = `${res.locals._baseUrl}${res.locals._path}?${res.locals._query}`;
    res.locals._csrfToken = ''; // we add after this middleware, for now empty string
    res.locals._flashSuccess = req.flash('success');
    res.locals._flashWarning = req.flash('warning');
    res.locals._flashDanger = req.flash('danger');
    res.locals._old = req.flash('old')[0] || {};
    res.locals._isAuthenticated = req.session.isLoggedIn;
    res.locals._assetsPath = require('./public/dist/manifest.json');
    res.locals = {...res.locals, ...permissions};

    // attach helper function to the view
    res.locals.moment = moment;
    res.locals.numberFormat = numberFormat;
    res.locals.validationError = validationError.bind(req.flash('error')[0] || {});
    res.locals.authorize = function (permission) {
        return req.session.permissions.hasOwnProperty(permission)
    };
    res.locals.getUrlParam = (key, defaultValue = '', urlString) => {
        if (!urlString) urlString = res.locals._currentFullUrl;
        const url = new URL(urlString);
        return url.searchParams.get(key) || defaultValue;
    };
    next();
});

// add method overriding _method: such as PUT, PATCH, DELETE
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method'));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

// Add router api before middleware csrf
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// Protect route from csrf
const csrfProtection = csrf({sessionKey: 'session'});
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals._csrfToken = req.csrfToken();
    next();
});

// add web app router
const mustAuthenticated = require('./middleware/mustAuthenticated');
const consoleRouter = require('./routes/console');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

app.use('/console', consoleRouter);
app.use('/auth', authRouter);
app.use('/', [mustAuthenticated, adminRouter]);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
const errorController = require('./controllers/error');
app.use(function (err, req, res, next) {
    // put auth state fallback
    if (!res.locals._isAuthenticated) {
        res.locals._isAuthenticated = false;
    }

    if (err.status === 404) {
        errorController.get404(req, res);
    } else if (err.status === 403) {
        errorController.get403(req, res);
    } else {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = isDev ? err : {};

        // render the error page
        if (isDev || req.app.get('env') === 'development') {
            if (req.xhr || (/application\/json/.test(req.get('accept')))) {
                res.status(err.status || 500).json({
                    status: 'error',
                    message: err.message,
                    code: err.status,
                    stack: err.stack
                });
            } else {
                res.status(err.status || 500);
                res.render('error');
            }
            console.log(err);
        } else {
            if (req.xhr || (/application\/json/.test(req.get('accept')))) {
                res.status(err.status || 500).json({
                    status: 'error',
                    message: err.message,
                });
            } else {
                errorController.get500(req, res);
            }
        }
    }
});

module.exports = {app, server};
