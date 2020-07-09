module.exports = {
    index: (req, res) => {
        res.render('admin/dashboard/index', {title: 'Dashboard'});
    }
}