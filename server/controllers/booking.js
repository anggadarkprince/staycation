const Booking = require('../models/Booking');
const Item = require('../models/Item');
const User = require('../models/User');
const Bank = require('../models/Bank');
const exporter = require('../modules/Exporter');
const moment = require('moment');
const path = require("path");
const fs = require("fs");

module.exports = {
    index: async (req, res) => {
        const sortBy = req.query.sort_by || 'createdAt';
        const sortMethod = Number(req.query.order_method) || -1;
        const search = req.query.search;
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;
        const isExported = req.query.export;

        const bookings = await Booking.find({
            ...((dateFrom || dateTo) && {
                createdAt: {
                    ...(dateFrom && {$gte: new Date(dateFrom)}),
                    ...(dateTo && {$lte: moment(dateTo).endOf('day').toDate()}),
                }
            }),
            ...(search && {
                $and: [{
                    $or: [
                        {transactionNumber: {$regex: `.*${search}.*`, $options: 'i'}},
                        {bank: {$regex: `.*${search}.*`, $options: 'i'}},
                        {accountNumber: {$regex: `.*${search}.*`, $options: 'i'}},
                        {accountHolder: {$regex: `.*${search}.*`, $options: 'i'}},
                        {status: {$regex: `.*${search}.*`, $options: 'i'}},
                    ]
                }]
            }),
        }).populate('userId').populate('bankId').populate('itemId._id').sort([[sortBy, sortMethod]]);

        if (isExported) {
            const exportedBookings = bookings.map(booking => {
                return {
                    transactionNumber: booking.transactionNumber,
                    name: booking.userId.name,
                    item: booking.itemId._id.title,
                    startDate: moment(booking.bookingStartDate).format('DD MMMM Y'),
                    endDate: moment(booking.bookingEndDate).format('DD MMMM Y'),
                    price: booking.itemId.price,
                    status: booking.status,
                }
            });
            const headers = exportedBookings.length ? Object.keys(exportedBookings[0]) : [];
            return res
                .attachment('bookings.xlsx')
                .send(exporter.toExcel('Bookings', exportedBookings, headers));
        } else {
            res.render('admin/booking/index', {title: 'Booking', bookings});
        }
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const booking = await Booking.findOne({_id: id}).populate('userId').populate('bankId').populate({
                path: 'itemId._id',
                populate: {
                    path: 'categoryId',
                    model: 'Category'
                }
            });
            res.render('admin/booking/view', {title: `View booking ${booking.transactionNumber}`, booking});
        } catch (err) {
            next(createError(404))
        }
    },
    create: async (req, res) => {
        const items = await Item.find();
        const users = await User.find();
        const banks = await Bank.find();

        res.render('admin/booking/create', {title: 'Create Booking', items, users, banks});
    },
    save: async (req, res) => {
        const {item: itemId, user: userId, from_date: fromDate, until_date: untilDate, bank: bankId, description} = req.body;
        try {
            const itemData = await Item.findById(itemId);
            const userData = await User.findById(userId);
            await Booking.create({
                transactionNumber: `TRN-${(new Date()).getTime()}`,
                bookingStartDate: new Date(fromDate),
                bookingEndDate: new Date(untilDate),
                itemId: {
                    _id: itemId,
                    price: itemData.price,
                    night: moment(untilDate).diff(moment(fromDate), 'days'),
                },
                userId,
                bankId,
                description
            });
            req.flash('success', `Booking item ${itemData.title} for ${userData.name} successfully created`);
            res.redirect('/admin/booking');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Save booking failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const booking = await Booking.findOne({_id: id});

        const items = await Item.find();
        const users = await User.find();
        const banks = await Bank.find();

        res.render('admin/booking/edit', {title: 'Edit Booking', booking, items, users, banks});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {item: itemId, user: userId, from_date: fromDate, until_date: untilDate, bank: bankId, description} = req.body;

        try {
            const booking = await Booking.findOne({_id: id});
            const itemData = await Item.findById(itemId);
            const userData = await User.findById(userId);

            booking.bookingStartDate = new Date(fromDate);
            booking.bookingEndDate = new Date(untilDate);
            booking.itemId = {
                _id: itemId,
                price: itemData.price,
                night: moment(untilDate).diff(moment(fromDate), 'days'),
            };
            booking.userId = userId;
            booking.bankId = bankId;
            booking.description = description;
            await booking.save();

            req.flash('success', `Booking item ${itemData.title} for ${userData.name} successfully updated`);
            return res.redirect('/admin/booking');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Update booking failed, try again later`);
            res.redirect('back');
        }
    },
    payment: async (req, res) => {
        const id = req.params.id;
        const booking = await Booking.findOne({_id: id}).populate('userId').populate('bankId').populate({
            path: 'itemId._id',
            populate: {
                path: 'categoryId',
                model: 'Category'
            }
        });

        res.render('admin/booking/payment', {title: 'Booking Payment', booking});
    },
    updatePayment: async (req, res) => {
        const id = req.params.id;
        const {bank, account_number: accountNumber, account_holder: accountHolder} = req.body;

        try {
            const booking = await Booking.findOne({_id: id});
            booking.proofPayment = path.join('/', req.file.path);
            booking.bank = bank;
            booking.accountNumber = accountNumber;
            booking.accountHolder = accountHolder;
            booking.status = 'PAID';
            await booking.save();

            req.flash('success', `Booking item ${booking.transactionNumber} successfully paid`);
            return res.redirect('/admin/booking');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Update booking failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Booking.findOne({_id: id});
            result.remove();

            if (result.proofPayment) {
                await fs.unlink(result.proofPayment.replace(/^(\\)/, ''), console.log);
            }

            req.flash('warning', `Item ${result.bank} successfully deleted`);
            return res.redirect('/admin/booking');
        } catch (err) {
            req.flash('danger', `Delete item failed, try again later`);
            res.redirect('back');
        }
    },
};
