const Bank = require('../models/Bank');
const exporter = require('../modules/Exporter');
const moment = require('moment');
const path = require("path");
const fs = require("fs");
const createError = require('http-errors');

module.exports = {
    index: async (req, res) => {
        const sortBy = req.query.sort_by || 'createdAt';
        const sortMethod = Number(req.query.order_method) || -1;
        const search = req.query.search;
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;
        const isExported = req.query.export;

        const banks = await Bank.find({
            ...((dateFrom || dateTo) && {
                createdAt: {
                    ...(dateFrom && {$gte: new Date(dateFrom)}),
                    ...(dateTo && {$lte: moment(dateTo).endOf('day').toDate()}),
                }
            }),
            ...(search && {
                $and: [{
                    $or: [
                        {bank: {$regex: `.*${search}.*`, $options: 'i'}},
                        {accountName: {$regex: `.*${search}.*`, $options: 'i'}},
                        {accountNumber: {$regex: `.*${search}.*`, $options: 'i'}},
                        {description: {$regex: `.*${search}.*`, $options: 'i'}},
                    ]
                }]
            }),
        }).sort([[sortBy, sortMethod]]);

        if (isExported) {
            return res
                .attachment('banks.xlsx')
                .send(exporter.toExcel('Banks', banks, ['bank', 'accountHolder', 'accountNumber', 'description', 'createdAt', 'updatedAt']));
        } else {
            res.render('bank/index', {banks, title: 'Bank'});
        }
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const bank = await Bank.findOne({_id: id});
            res.render('bank/view', {bank, title: `View bank ${bank.bank}`});
        } catch (err) {
            next(createError(404))
        }
    },
    create: (req, res) => {
        res.render('bank/create', {title: `Create bank`});
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
            res.redirect('/bank');
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

        res.render('bank/edit', {bank, title: `Edit bank ${bank.bank}`});
    },
    update: async (req, res) => {
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
            return res.redirect('/bank');
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
            return res.redirect('/bank');
        } catch (err) {
            req.flash('danger', `Delete bank failed, try again later`);
            res.redirect('back');
        }
    },
};
