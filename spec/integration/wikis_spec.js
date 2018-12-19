const   request = require('request'),
        server = require('../../src/server'),
        base = 'http://localhost:3000/wikis',
        User = require('../../src/db/models').User,
        Wiki = require('../../src/db/models').Wiki,
        sequelize = require('../../src/db/models/index').sequelize;

describe("routes: wikis", () => {

    beforeEach((done) => {
        this.user;
        this.wiki;

        sequelize.sync({force: true})
        .then(() => {

            User.create({
                username: "mozilla224",
                email: "mozillafan@gmail.com",
                password: "password"
            })
            .then((user) => {
                this.user = user;

                Wiki.create({
                    title: "Rollerblading",
                    body: "TODO: a guide on how to rollerblade",
                    private: false,
                    userId: this.user.id
                })
                .then((wiki) => {
                    this.wiki = wiki;
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            })

            done();
        })
        .catch((err) => {
            console.log(err);
            done();
        });
    });

    describe("guest testing suite", () => {

        describe("GET routes", () => {

            it("should allow guests access to wiki index route", (done) => {

                request.get(`${base}`, (err, res, body) => {
                    expect(body).toContain("Rollerblading");
                    done();
                });

            });

            it("should allow guests access to wiki show route", (done) => {

                request.get(`${base}/${this.wiki.id}`, (err, res, body) => {
                    expect(body).toContain("TODO: a guide on how to rollerblade");
                    done();
                });

            });

            it("should not allow guests to access new route", (done) => {

                request.get(`${base}/new`, (err, res, body) => {
                    expect(body).not.toContain("New Wiki");
                    done();
                });

            });

            it("should not allow guests to access edit route", (done) => {

                request.get(`${base}/${this.wiki.id}/edit`, (err, res, body) => {
                    expect(body).not.toContain("Edit Wiki");
                    expect(body).not.toContain("TODO: a guide on how to rollerblade");
                    done();
                });

            });

        });

        describe("POST routes", () => {

            it("should not allow guests to create new wikis", (done) => {
                const options = {
                    url: `${base}/create`,
                    form: {
                        title: "Don't Create This Wiki",
                        body: "This body should not exist",
                        private: false
                    }
                };

                request.post(options, (err, res, body) => {
                    Wiki.findOne({
                        where: {title: "Don't Create This Wiki"}
                    })
                    .then((wiki) => {
                        expect(wiki).toBeNull();
                        done();
                    })
                })
            });

            it("should not allow guests to edit wikis", (done) => {
                const options = {
                    url: `${base}/${this.wiki.id}/update`,
                    form: {
                        title: "Don't Edit This Wiki",
                        body: "Don't change the body to this wiki",
                        private: false
                    }
                };

                request.post(options, (err, res, body) => {
                    Wiki.findOne({
                        where: {id: this.wiki.id}
                    })
                    .then((wiki) => {
                        expect(wiki.title).toBe("Rollerblading");
                        expect(wiki.body).toBe("TODO: a guide on how to rollerblade");
                        done();
                    })
                });
            });

            it("should not allow guests to delete wikis", (done) => {
                request.post(`${base}/${this.wiki.id}/destroy`, (err, res, body) => {
                    Wiki.findOne({
                        where: {id: this.wiki.id}
                    })
                    .then((wiki) => {
                        expect(wiki).not.toBeNull();
                        done();
                    });
                });
            });

        });

    });

    describe("member testing suite", () => {

        beforeEach((done) => {
            request.get({
                url: "http://localhost:3000/auth/fake",
                form: {
                    userId: this.user.id,
                    username: this.user.username,
                    email: this.user.email,
                    role: "member"
                }
            }, (err, res, body) => {
                done();
            })
        });

        describe("GET routes", () => {

            it("should allow members to access wiki new route", (done) => {
                request.get(`${base}/new`, (err, res, body) => {
                    expect(body).toContain("New Wiki");
                    done();
                });
            });

            it("should allow members to access wiki edit route", (done) => {
                request.get(`${base}/${this.wiki.id}/edit`, (err, res, body) => {
                    expect(body).toContain("Edit Wiki");
                    expect(body).toContain("TODO: a guide on how to rollerblade");
                    done();
                });
            });

        });

        describe("POST routes", () => {

            it("should allow a member to update their own wiki", (done) => {
                const options = {
                    url: `${base}/${this.wiki.id}/update`,
                    form: {
                        title: "Rollerblading",
                        body: "Rollerblading is a sport as old as time itself.",
                        private: false
                    }
                };

                request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    Wiki.findOne({
                        where: {id: this.wiki.id}
                    })
                    .then((wiki) => {
                        expect(wiki.title).toBe("Rollerblading");
                        expect(wiki.body).toBe("Rollerblading is a sport as old as time itself.");
                        done();
                    });
                });
            });

            it("should allow a member to delete their own wiki", (done) => {
                request.post(`${base}/${this.wiki.id}/destroy`, (err, res, body) => {
                    Wiki.findOne({
                        where: {title: "Rollerblading"}
                    })
                    .then((wiki) => {
                        expect(wiki).toBeNull();
                        done();
                    });
                });
            });

            it("should allow a member to create a new wiki", (done) => {
                const options = {
                    url: `${base}/create`,
                    form: {
                        title: "Snowboarding",
                        body: "TODO: create a wiki on snowboarding",
                        private: false
                    }
                };

                request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    Wiki.findOne({
                        where: {title: "Snowboarding"}
                    })
                    .then((wiki) => {
                        expect(wiki.title).toBe("Snowboarding");
                        expect(wiki.body).toBe("TODO: create a wiki on snowboarding");
                        done();
                    });
                });
            });

        });

    });

});
