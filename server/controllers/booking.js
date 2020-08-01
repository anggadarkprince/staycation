const Booking = require('../models/Booking');
const exporter = require('../modules/Exporter');
const moment = require('moment');

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

        res.render('admin/booking/index', {title: 'Booking', bookings});
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
            console.log(booking);
            res.render('admin/booking/view', {title: `View booking ${booking.transactionNumber}`, booking});
        } catch (err) {
            next(createError(404))
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Booking.findOne({_id: id});
            result.remove();

            req.flash('warning', `Item ${result.bank} successfully deleted`);
            return res.redirect('/admin/booking');
        } catch (err) {
            req.flash('danger', `Delete item failed, try again later`);
            res.redirect('back');
        }
    },
};