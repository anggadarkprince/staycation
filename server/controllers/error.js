exports.get404 = (req, res) => {
    res.status(404).render('errors/404', {title: 'Page Not Found'});
};

exports.get403 = (req, res) => {
    res.status(403).render('errors/403', {title: 'Invalid form request'});
};

exports.get500 = (req, res) => {
    res.status(500).render('errors/500', {title: 'Internal server error'});
};