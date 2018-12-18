const   staticRoutes = require('../routes/static'),
        userRoutes = require('../routes/users');

module.exports = {
    init(app) {
        if(process.env.NODE_ENV.trim() === 'test') {
            const mockAuth = require('../../spec/support/mock-auth.js');
            mockAuth.fakeIt(app);
        }

        app.use(staticRoutes);
        app.use(userRoutes);
    }
}
