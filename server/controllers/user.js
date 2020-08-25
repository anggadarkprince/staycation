const createError = require('http-errors');
const User = require('../models/User');
const Role = require('../models/Role');
const exporter = require('../modules/Exporter');
const bcrypt = require('bcryptjs');
const path = require("path");
const fs = require("fs");
const moment = require('moment');

module.exports = {
    index: async (req, res) => {
        const sortBy = req.query.sort_by || 'createdAt';
        const sortMethod = Number(req.query.order_method) || -1;
        const search = req.query.search;
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;
        const isExported = req.query.export;

        const users = await User.find({
            ...((dateFrom || dateTo) && {
                createdAt: {
                    ...(dateFrom && {$gte: new Date(dateFrom)}),
                    ...(dateTo && {$lte: moment(dateTo).endOf('day').toDate()}),
                }
            }),
            ...(search && {
                $and: [{
                    $or: [
                        {name: {$regex: `.*${search}.*`, $options: 'i'}},
                        {username: {$regex: `.*${search}.*`, $options: 'i'}},
                        {email: {$regex: `.*${search}.*`, $options: 'i'}},
                        {status: {$regex: `.*${search}.*`, $options: 'i'}},
                    ]
                }]
            }),
        }).sort([[sortBy, sortMethod]]);

        if (isExported) {
            return res
                .attachment('users.xlsx')
                .send(exporter.toExcel('Users', users, ['name', 'username', 'email', 'status', 'createdAt', 'updatedAt']));
        } else {
            res.render('user/index', {users, title: 'User'});
        }
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const user = await User.findOne({_id: id}).populate('roleId', 'role');
            res.render('user/view', {user, title: `View user ${user.name}`});
        } catch (err) {
            next(createError(404))
        }
    },
    create: async (req, res) => {
        const roles = await Role.find();
        res.render('user/create', {title: `Create user`, roles});
    },
    save: async (req, res) => {
        const {name, username, email, password, status, roles: roleId} = req.body;
        try {
            const hashedPassword = bcrypt.hashSync(password, 12);
            const user = await User.create({
                name,
                username,
                password: hashedPassword,
                email,
                status,
                avatar: path.join('/', req.file.path),
                roleId
            });

            if (req.user.preferences.notificationNewUser) {
                const notificationMessage = {
                    message: `User ${name} recently registered to our system`,
                    url: `/user/view/${user._id}`
                };
                req.io.emit('new-user', notificationMessage);
            }

            req.flash('success', `User ${req.body.name} successfully created`);
            res.redirect('/user');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Save user ${req.body.name} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const user = await User.findOne({_id: id});
        const roles = await Role.find();

        res.render('user/edit', {title: `Edit user ${user.name}`, user, roles});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {name, username, email, password, status, roles} = req.body;

        try {
            const result = await User.findOne({_id: id});
            result.name = name;
            result.username = username;
            result.email = email;
            result.status = status;
            result.password = password ? bcrypt.hashSync(password, 12) : result.password;
            result.roleId = roles;
            if (req.file) {
                if (result.avatar) {
                    await fs.unlink(result.avatar.replace(/^(\\)/, ''), console.log);
                }
                result.avatar = path.join('/', req.file.path);
            }
            result.save();

            req.flash('success', `User ${name} successfully updated`);
            return res.redirect('/user');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Update user ${name} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await User.findOne({_id: id});
            result.remove();

            if (result.avatar) {
                await fs.unlink(result.avatar.replace(/^(\\)/, ''), console.log);
            }

            req.flash('warning', `User ${result.name} successfully deleted`);
            return res.redirect('/user');
        } catch (err) {
            req.flash('danger', `Delete user failed, try again later`);
            res.redirect('back');
        }
    },
};
