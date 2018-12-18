module.exports = {
    validateUsers(req, res, next) {
        if(req.method === "POST") {
            req.check("email").isEmail().withMessage("must be valid");
            req.check("password").isLength({min: 6}).withMessage("must be at least 6 characters in length");
            req.check("password_conf").matches(req.body.password).withMessage("must match password provided");
        }

        const errors = req.validationErrors();

        if(errors) {
            req.flash("error", errors);
            return res.redirect(req.headers.referer);
        } else {
            return next();
        }
    },
    validateSignIn(req, res, next) {
        if(req.method === "POST") {
            req.check("email").isEmail().withMessage("should contain a valid email");
        }

        const errors = req.validationErrors();

        if(errors) {
            req.flash("error", errors);
            return res.redirect(req.headers.referer);
        } else {
            return next();
        }
    }
}
