const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) {
            return res.sendStatus(401);
        }

        jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            } else {
                User.findById(user.userId)
                    .then(userData => {
                        req.user = userData;
                        next();
                    })
                    .catch(err => {
                        return res.sendStatus(401);
                    });
            }
        });
};
