const Item = require('../../models/Item');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const moment = require('moment');
const path = require("path");

module.exports = {
    save: async (req, res) => {
        const {
            item: itemId, user: userId, from_date: fromDate, until_date: untilDate, bank: bankId, description,
            bankFrom, accountNumber, accountHolder
        } = req.body;
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
                bookingStartDate: new Date(fromDate),
                bookingEndDate: new Date(untilDate),
                itemId: {
                    _id: itemId,
                    price: itemData.price,
                    duration: moment(untilDate, 'DD MMMM Y').diff(moment(fromDate, 'DD MMMM Y'), 'days'),
                },
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

            res.status(201).json({message: "Success Booking", booking});
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Something went wrong, try again later"});
        }
    }
}
