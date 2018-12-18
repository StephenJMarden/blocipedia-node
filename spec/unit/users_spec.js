const   sequelize = require('../../src/db/models/index').sequelize,
        User = require('../../src/db/models').User;

describe("User", () => {

    beforeEach((done) => {
        sequelize.sync({force: true})
        .then(() => {
            done();
        })
        .catch((err) => {
            console.log(err);
            done();
        })
    });

    describe("#create()", () => {

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

        it("should not create a user with a duplicate username", (done) => {
            User.create({
                username: "testuser",
                email: "unique@example.com",
                password: "password"
            })
            .then((user) => {
                // do nothing
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Validation error");
                done();
            });
        });

        it("should not create a user with a duplicate email address", (done) => {
            User.create({
                username: "uniqueuser",
                email: "testuser@example.com",
                password: "password"
            })
            .then((user) => {
                // do nothing
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Validation error");
                done();
            })
        })

    });

});
