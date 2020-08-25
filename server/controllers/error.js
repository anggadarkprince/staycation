exports.get404 = (req, res) => {
    if (req.xhr || (/application\/json/.test(req.get('accept')))) {
        res.status(404).json({status: 'error', message: 'Page Not Found'});
    } else {
        res.status(404).render('errors/404', {title: 'Page Not Found'});
    }
};

exports.get403 = (req, res) => {
    if (req.xhr || (/application\/json/.test(req.get('accept')))) {
        res.status(403).json({status: 'error', message: 'Invalid form request'});
    } else {
        res.status(403).render('errors/403', {title: 'Invalid form request'});
    }
};

exports.get500 = (req, res) => {
    if (req.xhr || (/application\/json/.test(req.get('accept')))) {
        res.status(500).json({status: 'error', message: 'Internal server error'});
    } else {
        res.status(500).render('errors/500', {title: 'Internal server error'});
    }
};
