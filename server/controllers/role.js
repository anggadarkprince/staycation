const Role = require('../models/Role');

module.exports = {
    index: async (req, res) => {
        const roles = await Role.find();
        res.render('admin/role/index', {roles, title: 'Role'});
    },
    view: async (req, res) => {
        const id = req.params.id;
        const role = await Role.findOne({_id: id});

        res.render('admin/role/view', {role, title: `View role ${role.role}`});
    },
    create: (req, res) => {
        res.render('admin/role/create', {title: 'Create role'});
    },
    save: async (req, res) => {
        const {role, description} = req.body;
        try {
            await Role.create({role, description});
            req.flash('success', `Role ${role} successfully created`);
            res.redirect('/admin/role');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Save role ${role} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const role = await Role.findOne({_id: id});

        res.render('admin/role/edit', {role, title: `Edit role ${user.name}`});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {role, description} = req.body;

        try {
            const result = await Role.findOne({_id: id});
            result.role = role;
            result.description = description;
            result.save();

            req.flash('success', `Role ${role} successfully updated`);
            return res.redirect('/admin/role');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Update role ${role} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Role.findOne({_id: id});
            result.remove();

            req.flash('warning', `Role ${result.role} successfully deleted`);
            return res.redirect('/admin/role');
        } catch (err) {
            req.flash('danger', `Delete role failed, try again later`);
            res.redirect('back');
        }
    },
};