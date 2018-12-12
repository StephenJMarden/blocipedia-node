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
                    password: '1234567890'
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

        /*describe("testing for duplicates", () => {
            beforeEach((done) => {

                User.create({
                    username: "testuser",
                    email: "testuser@example.com",
                    password: "password"
                })
                .then((user) => {
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });

            it("should not create a user with a duplicate email", (done) => {


                const newOptions = {
                    url: base,
                    form: {
                        username: "trialuser",
                        email: "testuser@example.com",
                        password: "password"
                    }
                };

                request.post(newOptions, (err, res, body) => {
                    User.findAll({where: {email: "testuser@example.com"}})
                    .then((users) => {
                        expect(users.length).toBe(1);
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    })
                });
            });

            it("should not create a user with a duplicate username", (done) => {

                User.create({
                    username: 'testuser',
                    email: 'uniqueemail@example.com',
                    password: 'password'
                })
                .then((user) => {
                    expect(user).toBeNull();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                })
            });


        });*/

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

    });

});
