const createError = require('http-errors');
const Category = require('../models/Category');
const exporter = require('../modules/Exporter');
const moment = require('moment');

module.exports = {
    index: async (req, res) => {
        const sortBy = req.query.sort_by || 'createdAt';
        const sortMethod = Number(req.query.order_method) || -1;
        const search = req.query.search;
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;
        const isExported = req.query.export;

        const categories = await Category.find({
            ...((dateFrom || dateTo) && {
                createdAt: {
                    ...(dateFrom && {$gte: new Date(dateFrom)}),
                    ...(dateTo && {$lte: moment(dateTo).endOf('day').toDate()}),
                }
            }),
            ...(search && {
                $and: [{
                    $or: [
                        {category: {$regex: `.*${search}.*`, $options: 'i'}},
                        {description: {$regex: `.*${search}.*`, $options: 'i'}},
                    ]
                }]
            }),
        }).sort([[sortBy, sortMethod]]);

        if (isExported) {
            return res
                .attachment('categories.xlsx')
                .send(exporter.toExcel('Categories', categories, ['category', 'description', 'createdAt', 'updatedAt']));
        } else {
            res.render('category/index', {categories, title: 'Category'});
        }
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const category = await Category.findOne({_id: id});
            res.render('category/view', {category, title: `View category ${category.category}`});
        } catch (err) {
            next(createError(404));
        }
    },
    create: (req, res) => {
        res.render('category/create', {title: 'Create category'});
    },
    save: async (req, res) => {
        const {category, description} = req.body;
        try {
            await Category.create({category, description});
            req.flash('success', `Category ${category} successfully created`);
            res.redirect('/category');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Save category ${category} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const category = await Category.findOne({_id: id});

        res.render('category/edit', {category, title: `Edit category ${category.category}`});
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
            return res.redirect('/category');
        }
        catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Update category ${category} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Category.findOne({_id: id});
            result.remove();

            req.flash('warning', `Category ${result.category} successfully deleted`);
            return res.redirect('/category');
        }
        catch (err) {
            req.flash('danger', `Delete category failed, try again later`);
            res.redirect('back');
        }
    },
};
