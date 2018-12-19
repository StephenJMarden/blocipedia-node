const   express = require('express'),
        router = express.Router(),
        userController = require('../controllers/userController'),
        validation = require('./validation');

router.get('/users/signup', userController.signUp);
router.post('/users', validation.validateUsers, userController.create);
router.get('/users/signin', userController.signInForm);
router.post('/users/signin', validation.validateSignIn, userController.signIn);
router.get('/users/signout', userController.signOut);
router.get('/users/admin/new', userController.newAdminForm);
router.post('/users/admin/create', userController.createAdmin);

module.exports = router;
