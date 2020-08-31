const Booking = require('../models/Booking');
const Item = require('../models/Item');
const User = require('../models/User');
const Bank = require('../models/Bank');
const Notification = require('../models/Notification');
const exporter = require('../modules/Exporter');
const {numberFormat} = require('../helpers/formatter');
const moment = require('moment');
const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require("path");
const fs = require("fs");

module.exports = {
    index: async (req, res) => {
        const sortBy = req.query.sort_by || 'createdAt';
        const sortMethod = Number(req.query.order_method) || -1;
        const search = req.query.search;
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;
        const status = req.query.status;
        const isExported = req.query.export;

        const bookings = await Booking.find({
            ...((dateFrom || dateTo) && {
                createdAt: {
                    ...(dateFrom && {$gte: new Date(dateFrom)}),
                    ...(dateTo && {$lte: moment(dateTo).endOf('day').toDate()}),
                }
            }),
            ...(status && {
                status: status
            }),
            ...(search && {
                $and: [{
                    $or: [
                        {transactionNumber: {$regex: `.*${search}.*`, $options: 'i'}},
                        {'payment.bank': {$regex: `.*${search}.*`, $options: 'i'}},
                        {'payment.accountNumber': {$regex: `.*${search}.*`, $options: 'i'}},
                        {'payment.accountHolder': {$regex: `.*${search}.*`, $options: 'i'}},
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
            res.render('booking/index', {title: 'Booking', bookings});
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
            res.render('booking/view', {title: `View booking ${booking.transactionNumber}`, booking});
        } catch (err) {
            next(createError(404))
        }
    },
    print: async (req, res) => {
        const id = req.params.id;
        try {
            const booking = await Booking.findOne({_id: id}).populate('userId').populate('bankId').populate({
                path: 'itemId._id',
                populate: {
                    path: 'categoryId',
                    model: 'Category'
                }
            });
            const logoUrl = '../public/dist/img/favicon.png';
            ejs.renderFile('views/booking/print.ejs', {booking, logoUrl, moment, numberFormat, require, path}, {}, (err, html) => {
                if (err) return console.log(err);
                pdf.create(html, { format: 'A4' }).toStream((err, stream) => {
                    if (err) return console.log(err);
                    res.setHeader('Content-type', 'application/pdf');
                    stream.pipe(res);
                });
            });
        } catch (err) {
            next(createError(404))
        }
    },
    create: async (req, res) => {
        const items = await Item.find();
        const users = await User.find();
        const banks = await Bank.find();

        res.render('booking/create', {title: 'Create Booking', items, users, banks});
    },
    save: async (req, res) => {
        const {item: itemId, user: userId, from_date: fromDate, until_date: untilDate, bank: bankId, description} = req.body;
        try {
            const itemData = await Item.findById(itemId);
            const userData = await User.findById(userId);
            const booking = await Booking.create({
                transactionNumber: `TRN-${(new Date()).getTime()}`,
                bookingStartDate: new Date(fromDate),
                bookingEndDate: new Date(untilDate),
                itemId: {
                    _id: itemId,
                    price: itemData.price,
                    duration: moment(untilDate, 'DD MMMM Y').diff(moment(fromDate, 'DD MMMM Y'), 'days') + 1,
                },
                userId,
                bankId,
                description
            });

            if (req.user.preferences.notificationNewBooking) {
                const notificationMessage = {
                    message: `Booking for item ${itemData.title}, please review if necessary`,
                    url: `/booking/view/${booking._id}`
                };
                req.io.emit('new-booking', notificationMessage);

                Notification.create({
                    userId: userId,
                    channel: 'new-booking',
                    ...notificationMessage,
                    createdAt: new Date(),
                });
            }

            req.flash('success', `Booking item ${itemData.title} for ${userData.name} successfully created`);
            res.redirect('/booking');
        } catch (err) {
            console.log(err);
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

        res.render('booking/edit', {title: 'Edit Booking', booking, items, users, banks});
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
                duration: moment(untilDate).diff(moment(fromDate), 'days') + 1,
            };
            booking.userId = userId;
            booking.bankId = bankId;
            booking.description = description;
            await booking.save();

            req.flash('success', `Booking item ${itemData.title} for ${userData.name} successfully updated`);
            return res.redirect('/booking');
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

        res.render('booking/payment', {title: 'Booking Payment', booking});
    },
    updatePayment: async (req, res) => {
        const id = req.params.id;
        const {bank, account_number: accountNumber, account_holder: accountHolder} = req.body;

        try {
            const booking = await Booking.findOne({_id: id});
            const payment = {};
            if (req.file) {
                if (booking.proofPayment) {
                    await fs.unlink(booking.proofPayment.replace(/^(\\)/, ''), console.log);
                }
                payment.proofPayment = path.join('/', req.file.path);
            }
            payment.bank = bank;
            payment.accountNumber = accountNumber;
            payment.accountHolder = accountHolder;
            payment.paidAt = new Date();
            booking.payment = payment;
            booking.status = 'PAID';
            await booking.save();

            if (req.user.preferences.notificationNewBooking) {
                const notificationMessage = {
                    message: `Payment for booking ${booking.transactionNumber} is submitted`,
                    url: `/booking/print/${booking._id}`
                };
                req.io.emit('booking-payment', notificationMessage);

                Notification.create({
                    userId: booking.userId,
                    channel: 'booking-payment',
                    ...notificationMessage,
                    createdAt: new Date(),
                });
            }

            req.flash('success', `Booking item ${booking.transactionNumber} successfully paid`);
            return res.redirect('/booking');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Update booking failed, try again later`);
            res.redirect('back');
        }
    },
    approve: async (req, res) => {
        try {
            const booking = await Booking.findByIdAndUpdate(req.params.id, {status: 'COMPLETED'});

            // send to specific user that owned the booking (if they are online)
            if (req.user.preferences.notificationNewBooking) {
                const notificationMessage = {
                    message: `Booking ${booking.transactionNumber} is approved`,
                    url: `/booking/view/${booking._id}`
                };
                if (req.socketConnections && req.socketConnections.hasOwnProperty(booking.userId)) {
                    const socketId = req.socketConnections[booking.userId];
                    req.io.to(socketId).emit('booking-validation', notificationMessage);
                }

                Notification.create({
                    userId: booking.userId,
                    channel: 'booking-approve',
                    ...notificationMessage,
                    createdAt: new Date(),
                });
            }

            req.flash('success', `Booking item ${booking.transactionNumber} is completed`);
            return res.redirect('/booking');
        } catch (err) {
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Update booking failed, try again later`);
            res.redirect('back');
        }
    },
    reject: async (req, res) => {
        try {
            const booking = await Booking.findByIdAndUpdate(req.params.id, {status: 'REJECTED'});

            // send to specific user that owned the booking (if they are online)
            if (req.user.preferences.notificationNewBooking) {
                const notificationMessage = {
                    message: `Booking ${booking.transactionNumber} is REJECTED`,
                    url: `/booking/view/${booking._id}`
                };
                if (req.socketConnections && req.socketConnections.hasOwnProperty(booking.userId)) {
                    const socketId = req.socketConnections[booking.userId];
                    req.io.to(socketId).emit('booking-validation', notificationMessage);
                }

                Notification.create({
                    userId: booking.userId,
                    channel: 'booking-reject',
                    ...notificationMessage,
                    createdAt: new Date(),
                });
            }

            req.flash('warning', `Booking item ${booking.transactionNumber} is REJECTED`);
            return res.redirect('/booking');
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
            return res.redirect('/booking');
        } catch (err) {
            req.flash('danger', `Delete item failed, try again later`);
            res.redirect('back');
        }
    },
};
