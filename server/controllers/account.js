const User = require('../models/User');
const Member = require('../models/Member');
const path = require("path");
const fs = require("fs");
const bcrypt = require('bcryptjs');

module.exports = {
    index: async (req, res) => {
        try {
            const account = await User.findById(req.user._id);
            const member = await Member.findOne({userId: req.user._id});
            res.render('account/index', {title: 'My Account', account, member});
        } catch (err) {
            res.redirect('/auth/login');
        }
    },
    update: async (req, res) => {
        try {
            const {name, username, email, new_password: newPassword} = req.body;
            const result = await User.findById(req.user._id);
            result.name = name;
            result.username = username;
            result.email = email;
            result.password = newPassword ? bcrypt.hashSync(newPassword, 12) : result.password;
            if (req.file) {
                if (result.avatar) {
                    await fs.unlink(result.avatar.replace(/^(\\)/, ''), console.log);
                }
                result.avatar = path.join('/', req.file.path);
            }
            result.save();

            // update profile information
            const {address, phone_number: phoneNumber, date_of_birth: dateOfBirth} = req.body;
            const member = await Member.findOne({ userId: req.user._id });
            if (member) {
                member.address = address;
                member.phoneNumber = phoneNumber;
                member.dateOfBirth = dateOfBirth;
                member.save();
            } else {
                await Member.create({
                    userId: req.user._id,
                    address,
                    phoneNumber,
                    dateOfBirth,
                });
            }

            req.flash('success', `Your account successfully updated`);
            return res.redirect('/account');
        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Update account failed, try again later`);
            res.redirect('back');
        }
    },
};
