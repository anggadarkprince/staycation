const Item = require('../../models/Item');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const {numberFormat} = require('../../helpers/formatter');
const moment = require('moment');
const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require("path");

module.exports = {
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
            const logoUrl = '../../public/dist/img/favicon.png';
            ejs.renderFile('views/admin/booking/print.ejs', {booking, logoUrl, moment, numberFormat, require, path}, {}, (err, html) => {
                if (err) return console.log(err);
                pdf.create(html, { format: 'A4' }).toStream((err, stream) => {
                    if (err) return console.log(err);
                    res.setHeader('Content-type', 'application/pdf');
                    //res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
                    stream.pipe(res);
                });
            });
        } catch (err) {
            next(createError(404))
        }
    },
    save: async (req, res) => {
        const {
            itemId, bookingStartDate, bookingEndDate, bankId, description,
            bankFrom, accountNumber, accountHolder
        } = req.body;
        const userId = req.user._id;

        try {
            const itemData = await Item.findById(itemId);
            const userData = await User.findById(userId);

            const payment = {
                bank: bankFrom, accountNumber, accountHolder,
                paidAt: new Date()
            };
            if (req.file) {
                payment.proofPayment = path.join('/', req.file.path);
            }
            const booking = await Booking.create({
                transactionNumber: `TRN-${(new Date()).getTime()}`,
                bookingStartDate: new Date(bookingStartDate),
                bookingEndDate: new Date(bookingEndDate),
                itemId: {
                    _id: itemId,
                    price: itemData.price,
                    duration: moment(bookingEndDate).diff(moment(bookingStartDate), 'days'),
                },
                status: payment.proofPayment ? 'PAID' : 'BOOKED',
                userId,
                bankId,
                description,
                payment,
            });

            if (userData.preferences && userData.preferences.notificationNewBooking) {
                const notificationMessage = {
                    message: `Booking for item ${itemData.title}, please review if necessary`,
                    url: `/admin/booking/view/${booking._id}`
                };
                req.io.emit('new-booking', notificationMessage);

                Notification.create({
                    userId: userId,
                    channel: 'new-booking',
                    ...notificationMessage,
                    createdAt: new Date(),
                });
            }

            res.status(201).json({message: "Accommodation are successfully booked", booking});
        } catch (err) {
            res.status(500).json({message: "Something went wrong, try again later"});
        }
    }
}
