require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const MongoDBStore = require('connect-mongodb-session')(session);
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const moment = require('moment');
const {Seeder} = require('mongo-seeding');
const {numberFormat} = require('./helpers/formatter');

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

mongoose.set('debug', true);
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions'
});
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Database initialized');
    })
    .catch(console.log);
mongoose.Promise = Promise;

const errorController = require('./controllers/error');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const User = require('./models/User');

const app = express();

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
app.use(session({secret: 'secret98sh968sdf7s8df6', resave: false, saveUninitialized: false, store: store}));
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.userId) {
        req.user = {};
        res.locals._loggedUser = {};
        return next();
    }
    User.findById(req.session.userId)
        .then(user => {
            req.user = user;
            res.locals._loggedUser = user;
            next();
        })
        .catch(console.log);
});

app.use((req, res, next) => {
    res.locals._baseUrl = `${req.protocol}://${req.get('host')}`;
    res.locals._path = req.path;
    res.locals._flashSuccess = req.flash('success');
    res.locals._flashWarning = req.flash('warning');
    res.locals._flashDanger = req.flash('danger');
    res.locals._old = req.flash('old')[0] || {};
    res.locals._isAuthenticated = req.session.isLoggedIn;
    res.locals.moment = moment;
    res.locals.numberFormat = numberFormat;
    next();
});

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

const mustAuthenticated = require('./middleware/mustAuthenticated');
app.use('/', indexRouter);
app.use('/admin', [mustAuthenticated, adminRouter]);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // put auth state fallback
    if (!res.locals._isAuthenticated) {
        res.locals._isAuthenticated = false;
    }

    if (err.status === 404) {
        errorController.get404(req, res);
    } else {
        // set locals, only providing error in development
        const isDev = req.app.get('env') === 'development';
        res.locals.message = err.message;
        res.locals.error = isDev ? err : {};

        // render the error page
        if (isDev) {
            res.status(err.status || 500);
            res.render('error');
        } else {
            errorController.get500(req, res);
        }
    }
});

module.exports = app;