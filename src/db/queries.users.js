const   User = require('./models').User,
        bcrypt = require('bcryptjs'),
        Wiki = require('./models').Wiki;

module.exports = {

    createUser(newUser, callback) {
        const   salt = bcrypt.genSaltSync(),
                hashedPassword = bcrypt.hashSync(newUser.password, salt);

        return User.create({
            username: newUser.username,
            email: newUser.email,
            password: hashedPassword,
            role: newUser.role || "member"
        })
        .then((user) => {
            callback(null, user);
        })
        .catch((err) => {
            callback(err);
        });
    },
    getUser(id, callback) {
        let result = {};
        User.findById(id, {
            include: [
                {model: Wiki, as: "wikis"}
            ]
        })
        .then((user) => {
            if(!user) {
                callback(404);
            } else {
                result["user"] = user;
                callback(null, user);
            }
        })
        .catch((err) => {
            callback(err);
        })
    },
    changeRole(id, role, callback) {
        return User.findById(id)
        .then((user) => {
            if(!user) {
                return callback("User not found!");
            }

            const newRole = {role: role};

            user.update(newRole, {
                fields: Object.keys(newRole)
            })
            .then(() => {
                if(newRole.role === "member") {
                    Wiki.update(
                        {private: false},
                        {where: {userId: user.id}}
                    )
                    .then(() => {
                        callback(null, user);
                    });
                } else {
                    callback(null, user);
                }
            })
            .catch((err) => {
                callback(err);
            })
        })
    }
}
