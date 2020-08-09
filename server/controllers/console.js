const Booking = require('../models/Booking');
const User = require('../models/User');
const {sendMail} = require('../helpers/mailer');
const {numberFormat} = require('../helpers/formatter');
const moment = require('moment');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// trigger `curl http://localhost:3000/console/report-weekly`
module.exports = {
    reportWeekly: async (req, res) => {
        try {
            const bookings = await Booking.find({
                createdAt: {
                    $gte: moment().subtract(7, "days"),
                    $lte: new Date(),
                }
            }).populate('userId').populate('itemId._id');

            const users = await User.find({
                'preferences.notificationInsight': '1'
            });
            const recipients = users.map(user => user.email);

            if (users.length) {
                let bookingList = '';
                bookings.forEach((booking, index) => {
                    bookingList += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${booking.transactionNumber}</td>
                            <td>${booking.userId.name}</td>
                            <td>${booking.itemId._id.title}</td>
                            <td>${numberFormat(booking.itemId.price * (1 + (req.settings.taxPercent / 100)) - (booking.itemId.discount || 0), req.settings.currencySymbol)}</td>
                        </tr>
                    `;
                });

                const mailOptions = {
                    from: `${process.env.APP_NAME} <${process.env.MAIL_ADMIN}>`,
                    to: recipients,
                    subject: `${process.env.APP_NAME} - Weekly Report`,
                    html: ejs.compile(fs.readFileSync(path.join(__dirname, '..', 'views', 'emails', 'basic.ejs'), 'utf8'))({
                        url: `${req.protocol}://${req.get('host')}`,
                        title: 'Weekly Report',
                        name: 'Admin',
                        email: users[0].email,
                        content: `
                            <table>
                            <tr>
                                <th>No</th>
                                <th>No Order</th>
                                <th>Name</th>
                                <th>Item</th>
                                <th>Price</th>
                            </tr>
                            ${bookingList}
                            </table>
                        `
                    })
                };

                sendMail(mailOptions, function (err) {
                    if (err) {
                        res.send('Report weekly failed to be sent');
                    } else {
                        res.send('Report weekly successfully sent');
                    }
                });
            } else {
                res.send('No recipient available');
            }
        } catch (err) {
            console.log(err);
            res.send('Send report weekly failed');
        }
    },
};
