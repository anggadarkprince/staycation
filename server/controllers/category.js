module.exports = {
    index: (req, res) => {
        res.render('admin/category/index');
    },
    create: (req, res) => {
        res.render('admin/category/create');
    },
};