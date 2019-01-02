const   userQueries = require('../db/queries.users.js'),
        passport = require('passport'),
        sgMail = require('@sendgrid/mail'),
        stripe = require('stripe')("sk_test_Jd7mrGpT9eAYwy1H7KNeE5lo");

        //sgMail.setApiKey('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');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
    signUp(req, res, next) {
        res.render('users/signup');
    },
    create(req, res, next) {
        let newUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirmation: req.body.password_conf
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
                    req.flash("error", {param: "Username", msg: "is already taken"});
                } else if(err.original.detail.includes("email") && err.original.detail.includes("already exists")) {
                    req.flash("error", {param: "Email", msg: "is already taken"});
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
    },
    newAdminForm(req, res, next) {
        res.render('users/newadmin');
    },
    createAdmin(req, res, next) {
        let newAdmin = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirmation: req.body.password_conf,
            role: "admin"
        };

        if(req.body.superpassword === process.env.ADMIN_CREATION_PASSWORD) {
            userQueries.createUser(newAdmin, (err, user) => {
                if(err) {
                    if(err.original.detail.includes("username") && err.original.detail.includes("already exists")) {
                        req.flash("error", {param: "Username", msg: "is already taken"});
                    } else if(err.original.detail.includes("email") && err.original.detail.includes("already exists")) {
                        req.flash("error", {param: "Email", msg: "is already taken"});
                    }
                    res.redirect('/users/signup');
                } else {
                    passport.authenticate("local")(req, res, () => {
                        req.flash("notice", "You have successfully created an admin user!");
                        res.redirect('/');
                    });
                }
            });
        } else {
            req.flash("notice", "You are not authorized to create a new admin user.");
            res.redirect('/');
        }
    },
    signInForm(req, res, next) {
        res.render('users/signin');
    },
    signIn(req, res, next) {
        passport.authenticate("local", {failureRedirect: '/users/signin', failureFlash: "Invalid email or password"})(req, res, () => {
            if(!req.user) {
                //nothing here
            } else {
                req.flash("notice", "You've successfully signed in!");
                res.redirect('/');
            }
        });
    },
    signOut(req, res, next) {
        req.logout();
        req.flash("notice", "You've successfully signed out!");
        res.redirect('/');
    },
    upgradeForm(req, res, next) {
        res.render('users/upgrade');
    },
    upgradeAccount(req, res, next) {
        const token = req.body.stripeToken;

        const charge = stripe.charges.create({
            amount: 1500,
            currency: 'usd',
            description: 'Account Upgrade',
            source: token
        })
        .then(() => {
            userQueries.changeRole(req.user.id, "premium", (err, user) => {
                if(err) {
                    req.flash("error", {param: "Error: ", msg: "An error has occurred in the upgrade process."});
                } else {
                    req.flash("notice", "You've successfully upgraded your account!");
                    res.redirect('/');
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
    },
    downgradeAccount(req, res, next) {
        userQueries.changeRole(req.user.id, "member", (err, user) => {
            if(err) {
                req.flash("error", {param: "Error: ", msg: "An error has occurred in the downgrade process."});
            } else {
                req.flash("notice", "You have successfully downgraded your account!");
                res.redirect('/');
            }
        });
    }
}
