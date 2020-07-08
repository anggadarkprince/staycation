const Category = require('../models/Category');

module.exports = {
    index: async (req, res) => {
        const categories = await Category.find();
        res.render('admin/category/index', {categories});
    },
    create: (req, res) => {
        res.render('admin/category/create');
    },
    save: async (req, res) => {
        const {category, description} = req.body;
        try {
            await Category.create({category, description});
            req.flash('success', `Category ${category} successfully created`);
            res.redirect('/admin/category');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Save category ${category} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const category = await Category.findOne({_id: id});

        res.render('admin/category/edit', {category});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {category, description} = req.body;

        try {
            const result = await Category.findOne({_id: id});
            result.category = category;
            result.description = description;
            result.save();

            req.flash('success', `Category ${category} successfully updated`);
            return res.redirect('/admin/category');
        }
        catch (err) {
            req.flash('old', {category, description});
            req.flash('danger', `Update category ${category} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            throw Error('a');
            const result = await Category.findOne({_id: id});
            result.remove();

            req.flash('warning', `Category ${result.category} successfully deleted`);
            return res.redirect('/admin/category');
        }
        catch (err) {
            req.flash('danger', `Delete category failed, try again later`);
            res.redirect('back');
        }
    },
};