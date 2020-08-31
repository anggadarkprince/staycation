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
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const booking = await Booking.findOne({_id: id}).populate('userId').populate('bankId').populate({
                path: 'itemId._id',
                populate: [{
                    path: 'categoryId',
                    model: 'Category'
                }, {
                    path: 'imageId',
                    select: '_id imageUrl isPrimary',
                }]
            });

            return res.json({
                _id: booking._id,
                transactionNumber: booking.transactionNumber,
                status: booking.status,
                createdAt: booking.createdAt,
                bookingStartDate: booking.bookingStartDate,
                bookingEndDate: booking.bookingEndDate,
                description: booking.description,
                rating: booking.rating,
                review: booking.review,
                reviewImage: booking.reviewImage && (res.locals._baseUrl + booking.reviewImage.replace(/\\/g, "/")),
                item: {
                    _id: booking.itemId._id._id,
                    title: booking.itemId._id.title,
                    city: booking.itemId._id.city,
                    country: booking.itemId._id.country,
                    imageUrl: res.locals._baseUrl + booking.itemId._id.imageId.find(image => image.isPrimary === true).imageUrl.replace(/\\/g, "/")
                },
                price: booking.itemId.price,
                duration: booking.itemId.duration,
                payment: {
                    ...booking._doc.payment,
                    proofPayment: booking.payment.proofPayment && (res.locals._baseUrl + booking.payment.proofPayment.replace(/\\/g, "/"))
                }
            });
        } catch (err) {
            next(createError(404))
        }
    },
    print: async (req, res, next) => {
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
            ejs.renderFile('views/booking/print.ejs', {
                booking,
                logoUrl,
                moment,
                numberFormat,
                require,
                path
            }, {}, (err, html) => {
                if (err) return console.log(err);
                pdf.create(html, {format: 'A4'}).toStream((err, stream) => {
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
                    duration: moment(bookingEndDate).diff(moment(bookingStartDate), 'days') + 1,
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
                    rating: booking.rating,
                    review: booking.review,
                    reviewImage: booking.reviewImage && (res.locals._baseUrl + booking.reviewImage.replace(/\\/g, "/")),
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
            const item = await Item.findById(booking.itemId._id);

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

            item.bookings.push({
                _id: booking._id,
            });

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

            res.status(204).send();
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Something went wrong, try again later"});
        }
    },
    rate: async (req, res) => {
        const id = req.params.id;
        const {review, rating} = req.body;

        try {
            const booking = await Booking.findById(id);
            const item = await Item.findById(booking.itemId._id);

            booking.review = review;
            booking.rating = rating;
            if (req.file) {
                booking.reviewImage = path.join('/', req.file.path);
            }
            await booking.save();

            const itemsBookings = item.bookings.filter(booked => booked._id.toString() !== booking._id.toString());
            itemsBookings.push({
                _id: booking._id,
                review: review,
                rating: rating
            });
            item.bookings = itemsBookings;
            item.save();

            res.status(204).send(); // send json will not delivered to requester (204 always no content)
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Something went wrong, try again later"});
        }
    }
}
