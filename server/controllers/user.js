module.exports = {
    index: (req, res) => {
        res.render('admin/user/index');
    },
    create: (req, res) => {
        res.render('admin/user/create');
    },
    save: (req, res) => {
        console.log(req);
        res.send('Got a DELETE request at /user ' + req.body.name)
    },
};