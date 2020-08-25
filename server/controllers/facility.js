const Facility = require('../models/Facility');
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

        const facilities = await Facility.find({
            ...((dateFrom || dateTo) && {
                createdAt: {
                    ...(dateFrom && {$gte: new Date(dateFrom)}),
                    ...(dateTo && {$lte: moment(dateTo).endOf('day').toDate()}),
                }
            }),
            ...(search && {
                $and: [{
                    $or: [
                        {facility: {$regex: `.*${search}.*`, $options: 'i'}},
                        {accountName: {$regex: `.*${search}.*`, $options: 'i'}},
                        {accountNumber: {$regex: `.*${search}.*`, $options: 'i'}},
                        {description: {$regex: `.*${search}.*`, $options: 'i'}},
                    ]
                }]
            }),
        }).sort([[sortBy, sortMethod]]);

        if (isExported) {
            return res
                .attachment('facilities.xlsx')
                .send(exporter.toExcel('Facilities', facilities, ['facility', 'description', 'createdAt', 'updatedAt']));
        } else {
            res.render('facility/index', {facilities, title: 'Facility'});
        }
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const facility = await Facility.findOne({_id: id});
            res.render('facility/view', {facility, title: `View facility ${facility.facility}`});
        } catch (err) {
            next(createError(404))
        }
    },
    create: (req, res) => {
        res.render('facility/create', {title: `Create facility`});
    },
    save: async (req, res) => {
        const {facility, description} = req.body;
        try {
            await Facility.create({
                facility,
                image: req.file ? path.join('/', req.file.path) : '',
                description
            });
            req.flash('success', `Facility ${facility} successfully created`);
            res.redirect('/facility');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Save facility ${facility} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const facility = await Facility.findOne({_id: id});

        res.render('facility/edit', {facility, title: `Edit facility ${facility.facility}`});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {facility, description} = req.body;

        try {
            const result = await Facility.findOne({_id: id});
            result.facility = facility;
            result.description = description;
            if (req.file) {
                if (result.image) {
                    await fs.unlink(result.image.replace(/^(\\)/, ''), console.log);
                }
                result.image = path.join('/', req.file.path);
            }
            await result.save();

            req.flash('success', `Facility ${facility} successfully updated`);
            return res.redirect('/facility');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Update facility ${facility} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Facility.findOne({_id: id});
            result.remove();

            if (result.image) {
                await fs.unlink(result.image.replace(/^(\\)/, ''), console.log);
            }

            req.flash('warning', `Facility ${result.facility} successfully deleted`);
            return res.redirect('/facility');
        } catch (err) {
            req.flash('danger', `Delete facility failed, try again later`);
            res.redirect('back');
        }
    },
};
