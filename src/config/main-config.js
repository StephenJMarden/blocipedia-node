require('dotenv').config();
const   path = require('path'),
        viewsFolder = path.join(__dirname, '..', 'views'),
        bodyParser = require('body-parser'),
        expressValidator = require('express-validator'),
        session = require('express-session'),
        flash = require('express-flash'),
        passportConfig = require('./passport-config'),
        logger = require('morgan');

module.exports = {
    init(app, express) {
        app.set('views', viewsFolder);
        app.set('view engine', 'ejs');
        app.use(logger('dev'));
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(expressValidator());
        app.use(session({
            secret: process.env.cookieSecret,
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 1.21e+9 }
        }));
        app.use(flash());
        // Stripping out passport until user models are created
        //passportConfig.init(app);

        app.use((req, res, next) => {
            res.locals.currentUser = req.user;
            next();
        })

        app.use(express.static(path.join(__dirname, '..', 'assets')));
    }
}
