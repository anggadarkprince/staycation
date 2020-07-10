const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const path = require("path");
const fs = require("fs");

module.exports = {
    index: async (req, res) => {
        const users = await User.find().sort([['_id', -1]]);
        res.render('admin/user/index', {users, title: 'User'});
    },
    view: async (req, res) => {
        const id = req.params.id;
        const user = await User.findOne({_id: id}).populate('roleId', 'role');

        res.render('admin/user/view', {user, title: `View user ${user.name}`});
    },
    create: async (req, res) => {
        const roles = await Role.find();
        res.render('admin/user/create', {title: `Create user`, roles});
    },
    save: async (req, res) => {
        const {name, username, email, password, status, roles: roleId} = req.body;
        try {
            const hashedPassword = bcrypt.hashSync(password, 12);
            await User.create({
                name,
                username,
                password: hashedPassword,
                email,
                status,
                avatar: path.join('/', req.file.path),
                roleId
            });
            req.flash('success', `User ${req.body.name} successfully created`);
            res.redirect('/admin/user');
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

        res.render('admin/user/edit', {title: `Edit user ${user.name}`, user, roles});
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
            return res.redirect('/admin/user');
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
            return res.redirect('/admin/user');
        } catch (err) {
            req.flash('danger', `Delete user failed, try again later`);
            res.redirect('back');
        }
    },
};