const   express = require('express'),
        router = express.Router(),
        userController = require('../controllers/userController');

router.get('/users/signup', userController.signUp);
router.post('/users', userController.create);

module.exports = router;
