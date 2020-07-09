const Item = require('../models/Item');

module.exports = {
    index: async (req, res) => {
        const items = await Item.find();
        res.render('admin/item/index', {items, title: 'Item'});
    },
    view: async (req, res) => {
        const id = req.params.id;
        const item = await Item.findOne({_id: id});

        res.render('admin/item/view', {Item, title: `View Item ${item.title}`});
    },
    create: (req, res) => {
        res.render('admin/item/create', {title: 'Create Item'});
    },
    save: async (req, res) => {
        const {Item, description} = req.body;
        try {
            await Item.create({Item, description});
            req.flash('success', `Item ${Item} successfully created`);
            res.redirect('/admin/Item');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Save Item ${Item} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const Item = await Item.findOne({_id: id});

        res.render('admin/Item/edit', {Item, title: `Edit Item ${Item.Item}`});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {Item, description} = req.body;

        try {
            const result = await Item.findOne({_id: id});
            result.Item = Item;
            result.description = description;
            result.save();

            req.flash('success', `Item ${Item} successfully updated`);
            return res.redirect('/admin/Item');
        }
        catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Update Item ${Item} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Item.findOne({_id: id});
            result.remove();

            req.flash('warning', `Item ${result.Item} successfully deleted`);
            return res.redirect('/admin/Item');
        }
        catch (err) {
            req.flash('danger', `Delete Item failed, try again later`);
            res.redirect('back');
        }
    },
};