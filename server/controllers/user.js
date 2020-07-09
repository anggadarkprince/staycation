const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = {
    index: async (req, res) => {
        const users = await User.find();
        res.render('admin/user/index', {users, title: 'User'});
    },
    view: async (req, res) => {
        const id = req.params.id;
        const user = await User.findOne({_id: id});

        res.render('admin/user/view', {user, title: `View user ${user.name}`});
    },
    create: (req, res) => {
        res.render('admin/user/create', {title: `Create user`});
    },
    save: async (req, res) => {
        const {name, username, email, password, status} = req.body;
        try {
            const hashedPassword = bcrypt.hashSync(password, 12);
            await User.create({name, username, password: hashedPassword, email, status});
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

        res.render('admin/user/edit', {user, title: `Edit user ${user.name}`});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {name, username, email, password, status} = req.body;

        try {
            const result = await User.findOne({_id: id});
            result.name = name;
            result.username = username;
            result.email = email;
            result.status = status;
            result.password = password ? bcrypt.hashSync(password, 12) : result.password;
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

            req.flash('warning', `User ${result.name} successfully deleted`);
            return res.redirect('/admin/user');
        } catch (err) {
            req.flash('danger', `Delete user failed, try again later`);
            res.redirect('back');
        }
    },
};