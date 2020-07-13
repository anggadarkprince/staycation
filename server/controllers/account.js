const User = require('../models/User');
const path = require("path");
const fs = require("fs");
const bcrypt = require('bcryptjs');

module.exports = {
    index: async (req, res) => {
        try {
            const account = await User.findById(req.user._id);
            res.render('admin/account/index', {title: 'My Account', account});
        } catch (err) {
            res.redirect('/auth/login');
        }
    },
    update: async (req, res) => {
        const {name, username, email, password} = req.body;

        try {
            const result = await User.findOne({_id: '5f07d8ac1e01fd83f8bb63e0'});
            result.name = name;
            result.username = username;
            result.email = email;
            result.password = password ? bcrypt.hashSync(password, 12) : result.password;
            if (req.file) {
                if (result.avatar) {
                    await fs.unlink(result.avatar.replace(/^(\\)/, ''), console.log);
                }
                result.avatar = path.join('/', req.file.path);
            }
            result.save();

            req.flash('success', `Your account successfully updated`);
            return res.redirect('/admin/account');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Update account failed, try again later`);
            res.redirect('back');
        }
    },
};