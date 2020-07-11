const Item = require('../models/Item');

module.exports = {
    index: async (req, res) => {
        const items = await Item.find();
        res.render('admin/item/index', {title: 'Item', items});
    },
    view: async (req, res) => {
        const id = req.params.id;
        const item = await Item.findOne({_id: id});

        res.render('admin/item/view', {title: `View item ${item.title}`, item});
    },
    create: (req, res) => {
        res.render('admin/item/create', {title: 'Create Item'});
    },
    save: async (req, res) => {
        const {title, price, country, city, is_popular: isPopular, description} = req.body;
        try {
            await Item.create({title, price, country, city, isPopular, description});
            req.flash('success', `Item ${title} successfully created`);
            res.redirect('/admin/item');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Save item ${title} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const item = await Item.findOne({_id: id});

        res.render('admin/item/edit', {title: `Edit item ${item.title}`, item});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {title, price, country, city, is_popular: isPopular, description} = req.body;

        try {
            const result = await Item.findOne({_id: id});
            result.title = title;
            result.price = price;
            result.country = country;
            result.city = city;
            result.isPopular = isPopular;
            result.description = description;
            result.save();

            req.flash('success', `Item ${title} successfully updated`);
            return res.redirect('/admin/item');
        }
        catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Update item ${title} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Item.findOne({_id: id});
            result.remove();

            req.flash('warning', `Item ${result.title} successfully deleted`);
            return res.redirect('/admin/item');
        }
        catch (err) {
            req.flash('danger', `Delete item failed, try again later`);
            res.redirect('back');
        }
    },
};