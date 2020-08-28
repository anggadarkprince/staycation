const Item = require('../../models/Item');
const Booking = require('../../models/Booking');
const Notification = require('../../models/Notification');
const {numberFormat} = require('../../helpers/formatter');
const moment = require('moment');
const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require("path");
const createError = require("http-errors");

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
            ejs.renderFile('views/booking/print.ejs', {booking, logoUrl, moment, numberFormat, require, path}, {}, (err, html) => {
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
        const {itemId, bookingStartDate, bookingEndDate, description} = req.body;

        try {
            const itemData = await Item.findById(itemId);

            const booking = await Booking.create({
                transactionNumber: `TRN-${(new Date()).getTime()}`,
                bookingStartDate: new Date(bookingStartDate),
                bookingEndDate: new Date(bookingEndDate),
                itemId: {
                    _id: itemId,
                    price: itemData.price,
                    duration: moment(bookingEndDate).diff(moment(bookingStartDate), 'days'),
                },
                status: 'BOOKED',
                userId: req.user._id,
                description,
            });

            if (req.user.preferences && req.user.preferences.notificationNewBooking) {
                const notificationMessage = {
                    message: `Booking for item ${itemData.title} submitted, continue to payment?`,
                    url: `/profile/outstanding`
                };
                req.io.emit('new-booking', notificationMessage);

                Notification.create({
                    userId: userId,
                    channel: 'new-booking',
                    ...notificationMessage,
                    createdAt: new Date(),
                });
            }

            const resultBooking = await Booking.findById(booking._id)
                .populate({
                    path: 'itemId._id',
                    populate: {
                        path: 'imageId',
                        select: '_id imageUrl isPrimary',
                    }
                });

            res.status(201).json({
                message: "Accommodation are successfully booked",
                booking: {
                    _id: resultBooking._id,
                    transactionNumber: resultBooking.transactionNumber,
                    status: resultBooking.status,
                    createdAt: resultBooking.createdAt,
                    bookingStartDate: resultBooking.bookingStartDate,
                    bookingEndDate: resultBooking.bookingEndDate,
                    description: resultBooking.description,
                    item: {
                        _id: resultBooking.itemId._id._id,
                        title: resultBooking.itemId._id.title,
                        city: resultBooking.itemId._id.city,
                        country: resultBooking.itemId._id.country,
                        imageUrl: res.locals._baseUrl + resultBooking.itemId._id.imageId.find(image => image.isPrimary === true).imageUrl.replace(/\\/g, "/")
                    },
                    price: resultBooking.itemId.price,
                    duration: resultBooking.itemId.duration,
                    payment: {
                        ...resultBooking._doc.payment
                    }
                }
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Something went wrong, try again later"});
        }
    },
    payment: async (req, res) => {
        const {bookingId, bankFrom, accountNumber, accountHolder, bankId} = req.body;

        try {
            const booking = await Booking.findById(bookingId);

            const payment = {
                bank: bankFrom, accountNumber, accountHolder,
                paidAt: new Date()
            };
            if (req.file) {
                payment.proofPayment = path.join('/', req.file.path);
            }
            booking.bankId = bankId;
            booking.payment = payment;
            booking.status = 'PAID';
            booking.save();

            if (req.user.preferences.notificationNewBooking) {
                const notificationMessage = {
                    message: `Payment for booking ${booking.transactionNumber} is submitted`,
                    url: `/profile/outstanding`
                };
                req.io.emit('booking-payment', notificationMessage);

                Notification.create({
                    userId: booking.userId,
                    channel: 'booking-payment',
                    ...notificationMessage,
                    createdAt: new Date(),
                });
            }

            res.status(204).json({message: `Booking item ${booking.transactionNumber} successfully paid`, booking});
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Something went wrong, try again later"});
        }
    }
}
