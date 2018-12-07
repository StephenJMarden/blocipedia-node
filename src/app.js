const   express = require('express'),
        app = express(),
        routeConfig = require('./config/route-config'),
        appConfig = require('./config/main-config');

appConfig.init(app, express);
routeConfig.init(app);

module.exports = app;
