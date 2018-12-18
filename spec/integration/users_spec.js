const   request = require('request'),
        server = require('../../src/server.js'),
        base = 'http://localhost:3000/users',
        User = require('../../src/db/models').User,
        sequelize = require('../../src/db/models/index').sequelize;

describe("routes: users", () => {

    beforeEach((done) => {
        sequelize.sync({force: true})
        .then(() => {
            done();
        })
        .catch((err) => {
            console.log(err);
            done();
        });
    });

    describe("GET /users/signup", () => {

        it("should render a user signup form", (done) => {
            request.get(`${base}/signup`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('Register Account');
                done();
            });
        });

    });

    describe("POST /users", () => {

        it("should create a new user with valid values", (done) =>{

            const options = {
                url: base,
                form: {
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: '1234567890',
                    password_conf: '1234567890'
                }
            };

            request.post(options, (err, res, body) => {
                User.findOne({where: {username: 'newuser'}})
                .then((user) => {
                    expect(user).not.toBeNull();
                    expect(user.username).toBe('newuser');
                    expect(user.email).toBe('newuser@example.com');
                    expect(user.id).toBe(1);
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });

        });

        it("should not create a user with invalid values", (done) => {

            const options = {
                username: ' ',
                email: 'no',
                password: '1234567890'
            };

            request.post(options, (err, res, body) => {
                User.findOne({where: {username: ' '}})
                .then((user) => {
                    expect(user).toBeNull();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                })
            });

        });

        describe("user signing in", () => {

            beforeEach((done) => {
                this.user;

                User.create({
                    username: "mozilla224",
                    email: "mozillafan@gmail.com",
                    password: "password",
                    password_conf: "password"
                })
                .then((user) => {
                    this.user = user;
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });

            it("should not allow two users with the same email address", (done) => {
                const options = {
                    url: `${base}/signup`,
                    form: {
                        email: "mozillafan@gmail.com",
                        username: "randomuser",
                        password: "password",
                        password_conf: "password"
                    }
                };

                request.get(options, (err, res, body) => {
                    User.findAll({where: {email: "mozillafan@gmail.com"}})
                    .then((users) => {
                        console.log(users);
                        expect(users.length).toBe(1);
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    })
                })
            })

            it("should render a view with a sign in form", (done) => {
                request.get(`${base}/signin`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("Sign In to Blocipedia");
                    done();
                })
            })

            it("should not allow an invalid email", (done) => {
                const options = {
                    url: `${base}/signin`,
                    form: {
                        email: 'wrongemail@gmail.com',
                        password: "password"
                    }
                };

                request.post(options, (err, res, body) => {
                    expect(body).toContain("Redirecting to /users/signin");
                    done();
                })
            });

            it("should not allow an invalid password", (done) => {
                const options = {
                    url: `${base}/signin`,
                    form: {
                        email: "mozillafan@gmail.com",
                        password: "wrongpassword"
                    }
                };

                request.post(options, (err, res, body) => {
                    expect(body).toContain("Redirecting to /users/signin");
                    done();
                });
            });

        });


    });

});
