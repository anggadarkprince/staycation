module.exports = {
    isAuthorized: function (permission) {
        return function (req, res, next) {
            if (!req.session.permissions.hasOwnProperty(permission)) {
                req.flash('danger', `You are unauthorized to perform this action`);
                return res.status(403).redirect(403, '/dashboard');
            }
            next();
        };
    }
};
