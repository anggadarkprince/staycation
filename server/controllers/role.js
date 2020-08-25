const createError = require('http-errors');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
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

        const roles = await Role.aggregate([
            {
                $project: {
                    role: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    permissionId: 1,
                    totalPermission: {$size: "$permissionId"}
                }
            },
            {
                $match: {
                    ...((dateFrom || dateTo) && {
                        createdAt: {
                            ...(dateFrom && {$gte: new Date(dateFrom)}),
                            ...(dateTo && {$lte: moment(dateTo).endOf('day').toDate()}),
                        }
                    }),
                    ...(search && {
                        $and: [{
                            $or: [
                                {role: {$regex: `.*${search}.*`, $options: 'i'}},
                                {description: {$regex: `.*${search}.*`, $options: 'i'}},
                            ]
                        }]
                    }),
                }
            },
            {$sort: {[sortBy]: sortMethod}},
        ]);

        if (isExported) {
            const dataRoles = [];
            roles.forEach((role, index) => {
                dataRoles.push({
                    no: index + 1,
                    role: role.role,
                    description: role.description,
                    createdAt: role.createdAt,
                    updatedAt: role.updatedAt
                })
            });
            return res
                .attachment('roles.xlsx')
                .send(exporter.toExcel('Roles', dataRoles));
        } else {
            res.render('role/index', {roles, title: 'Role'});
        }
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const role = await Role.findOne({_id: id}).populate('permissionId');
            res.render('role/view', {role, title: `View role ${role.role}`});
        } catch (err) {
            next(createError(404))
        }
    },
    create: async (req, res) => {
        const permissions = await Permission.find();
        res.render('role/create', {title: 'Create role', permissions});
    },
    save: async (req, res) => {
        const {role, description, permissions: permissionId} = req.body;
        try {
            await Role.create({role, description, permissionId});
            req.flash('success', `Role ${role} successfully created`);
            res.redirect('/role');
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

        res.render('role/edit', {title: `Edit role ${role.role}`, role, permissions});
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
            return res.redirect('/role');
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
            return res.redirect('/role');
        } catch (err) {
            req.flash('danger', `Delete role failed, try again later`);
            res.redirect('back');
        }
    },
};
