const Booking = require('../../models/Booking');
const User = require('../../models/User');
const Member = require('../../models/Member');
const createError = require('http-errors');

module.exports = {
    index: async (req, res) => {
        try {
            const user = req.user;
            const member = await Member.findOne({userId: user._id});
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
                    },
                    member: {
                        address: member.address,
                        phoneNumber: member.phoneNumber,
                        dateOfBirth: member.dateOfBirth,
                    }
                }
            });
        } catch (err) {
            next(createError(500, err));
        }
    },
    basic: async (req, res) => {
        try {
            const {name, username, email} = req.body;
            const result = await User.findById(req.user._id);
            result.name = name;
            result.username = username;
            result.email = email;
            if (req.file) {
                if (result.avatar) {
                    await fs.unlink(result.avatar.replace(/^(\\)/, ''), console.log);
                }
                result.avatar = path.join('/', req.file.path);
            }
            result.save();

            // update profile information
            const {phoneNumber, dateOfBirth, address} = req.body;
            const member = await Member.findOne({ userId: req.user._id });
            if (member) {
                member.address = address;
                member.phoneNumber = phoneNumber;
                member.dateOfBirth = dateOfBirth;
                member.save();
            } else {
                await Member.create({
                    userId: req.user._id,
                    address,
                    phoneNumber,
                    dateOfBirth,
                });
            }

            res.json({status: 'success', message: 'Your account successfully updated'});
        } catch (err) {
            next(createError(500, err));
        }
    },
}
