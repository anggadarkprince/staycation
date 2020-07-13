const createError = require('http-errors');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

module.exports = {
    index: async (req, res) => {
        const roles = await Role.find().sort([['_id', -1]]);
        res.render('admin/role/index', {roles, title: 'Role'});
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const role = await Role.findOne({_id: id}).populate('permissionId');
            res.render('admin/role/view', {role, title: `View role ${role.role}`});
        } catch (err) {
            next(createError(404))
        }
    },
    create: async (req, res) => {
        const permissions = await Permission.find();
        res.render('admin/role/create', {title: 'Create role', permissions});
    },
    save: async (req, res) => {
        const {role, description, permissions: permissionId} = req.body;
        try {
            await Role.create({role, description, permissionId});
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
        const permissions = await Permission.find();

        res.render('admin/role/edit', {title: `Edit role ${role.role}`, role, permissions});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {role, description, permissions} = req.body;

        try {
            const result = await Role.findOne({_id: id});
            result.role = role;
            result.description = description;
            result.permissionId = permissions;
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