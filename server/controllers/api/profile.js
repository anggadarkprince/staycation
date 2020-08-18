const Booking = require('../../models/Booking');
const User = require('../../models/User');
const createError = require('http-errors');

module.exports = {
    index: async (req, res) => {
        try {
            const user = req.user;
            const bookings = await Booking.find({userId: user._id})
                .populate('itemId._id')
                .sort([['createdAt', -1]]);
            const allBookings = bookings.map(booking => {
                return {
                    transactionNumber: booking.transactionNumber,
                    status: booking.status,
                    createdAt: booking.createdAt,
                    bookingStartDate: booking.bookingStartDate,
                    bookingEndDate: booking.bookingEndDate,
                    description: booking.description,
                    item: {
                        title: booking.itemId._id.title,
                        city: booking.itemId._id.city,
                        country: booking.itemId._id.country,
                    },
                    price: booking.itemId.price,
                    duration: booking.itemId.duration,
                    payment: {
                        ...booking._doc.payment
                    }
                }
            });
            const outstandingBookings = allBookings.filter(booking => ['BOOKED', 'PAID'].includes(booking.status));
            const completedBookings = allBookings.filter(booking => booking.status === 'COMPLETED');

            res.json({
                user: {
                    _id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    status: user.status,
                    avatar: res.locals._baseUrl + user.avatar.replace(/\\/g, "/"),
                    preferences: user.preferences,
                    bookings: {
                        allBookings: allBookings,
                        outstandingBookings: outstandingBookings,
                        completedBookings: completedBookings,
                    }
                }
            });
        } catch (err) {
            next(createError(500, err));
        }
    },
}
