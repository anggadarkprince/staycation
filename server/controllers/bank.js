const Bank = require('../models/Bank');
const path = require("path");
const fs = require("fs");
const createError = require('http-errors');
const {validationError} = require('../helpers/formatter');

module.exports = {
    index: async (req, res) => {
        const banks = await Bank.find().sort([['_id', -1]]);
        res.render('admin/bank/index', {banks, title: 'Bank'});
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const bank = await Bank.findOne({_id: id});
            res.render('admin/bank/view', {bank, title: `View bank ${bank.bank}`});
        } catch (err) {
            next(createError(404))
        }
    },
    create: (req, res) => {
        res.render('admin/bank/create', {title: `Create bank`});
    },
    save: async (req, res) => {
        const {bank, account_number: accountNumber, account_holder: accountHolder, description} = req.body;
        try {
            await Bank.create({
                bank,
                accountNumber,
                accountHolder,
                logo: req.file ? path.join('/', req.file.path) : '',
                description
            });
            req.flash('success', `Bank ${bank} successfully created`);
            res.redirect('/admin/bank');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Save bank ${bank} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const bank = await Bank.findOne({_id: id});

        res.render('admin/bank/edit', {bank, title: `Edit bank ${bank.bank}`});
    },
    update: async (req, res, next) => {
        const id = req.params.id;
        const {bank, account_number: accountNumber, account_holder: accountHolder, description} = req.body;

        try {
            const result = await Bank.findOne({_id: id});
            result.bank = bank;
            result.accountNumber = accountHolder;
            result.accountNumber = accountNumber;
            result.description = description;
            if (req.file) {
                if (result.logo) {
                    await fs.unlink(result.logo.replace(/^(\\)/, ''), console.log);
                }
                result.logo = path.join('/', req.file.path);
            }
            await result.save();

            req.flash('success', `Bank ${bank} successfully updated`);
            return res.redirect('/admin/bank');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Update bank ${bank} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Bank.findOne({_id: id});
            result.remove();

            if (result.logo) {
                await fs.unlink(result.logo.replace(/^(\\)/, ''), console.log);
            }

            req.flash('warning', `Bank ${result.bank} successfully deleted`);
            return res.redirect('/admin/bank');
        } catch (err) {
            req.flash('danger', `Delete bank failed, try again later`);
            res.redirect('back');
        }
    },
};