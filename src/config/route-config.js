const   staticRoutes = require('../routes/static');

module.exports = {
    init(app) {
        //not sure if implemented the same in this project
        /*if(process.env.NODE_ENV.trim() === 'test') {
            const mockAuth = require('../../spec/support/mock-auth.js');
            mockAuth.fakeIt(app);
        }*/

        app.use(staticRoutes);
    }
}
