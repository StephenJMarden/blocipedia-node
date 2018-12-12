const   userQueries = require('../db/queries.users.js'),
        passport = require('passport'),
        sgMail = require('@sendgrid/mail');

        sgMail.setApiKey('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');

module.exports = {
    signUp(req, res, next) {
        res.render('users/signup');
    },
    create(req, res, next) {
        let newUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirmation: req.body.passwordConfirmation
        };

        userQueries.createUser(newUser, (err, user) => {
            const msg = {
                to: newUser.email,
                from: 'noreply@blocipedia.com',
                subject: 'Welcome to Blocipedia!',
                html: `Thanks for signing up for Blocipedia, ${newUser.username}!<br><br>`
                +`<strong>If you did not sign up for an account recently, contact us at customersupport@blocipedia.com</strong>`
            }
            if(err) {
                if(err.original.detail.includes("username") && err.original.detail.includes("already exists")) {
                    req.flash("error", "Username taken");
                } else if(err.original.detail.includes("email") && err.original.detail.includes("already exists")) {
                    req.flash("error", "Email taken");
                }
                res.redirect('/users/signup');
            } else {
                passport.authenticate("local")(req, res, () => {
                    sgMail.send(msg)
                    .then(() => {
                        console.log("Email sent!");
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                    req.flash("notice", "You have successfully signed in!");
                    res.redirect('/');
                });
            }
        });
    }
}
