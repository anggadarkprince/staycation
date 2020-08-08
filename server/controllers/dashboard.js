const Booking = require('../models/Booking');
const moment = require('moment');

module.exports = {
    index: async (req, res) => {
        const earningMonthResult = await Booking.aggregate([
            {
                $group: {
                    _id : {
                        year: {$year: "$createdAt"},
                        month: {$month: "$createdAt"},
                    },
                    results: {$push: '$$ROOT'},
                    total: { $sum: '$itemId.price' },
                }
            },
            {
                $group: {
                    _id : "$_id.year",
                    average: { $avg: "$total" },
                }
            },
        ]);
        const earningMonthAvg = earningMonthResult.length ? {
            year: earningMonthResult[0]._id, average: earningMonthResult[0].average
        } : {year: (new Date).getFullYear(), average: 0};

        const earningYearResult = await Booking.aggregate([
            {
                $group: {
                    _id : {$year: "$createdAt"},
                    total: { $sum: '$itemId.price' },
                }
            },
            { $limit: 1 }
        ]);
        const earningYearTotal = earningYearResult.length ? {
            year: earningYearResult[0]._id, total: earningYearResult[0].total
        } : {year: (new Date).getFullYear(), average: 0};

        const totalBooking = await Booking.countDocuments({});
        const totalOutstanding = await Booking.countDocuments({
            $or: [
                {status: 'BOOKED'},
                {status: 'PAID'},
            ]
        });
        const totalProceed = await Booking.countDocuments({status: 'PAID'});
        const totalBookingOutstanding = totalOutstanding > 0 ? Number(totalProceed / totalOutstanding * 100).toFixed(2) : 100;


        const earningMonthly = await Booking.aggregate([
            {
                $group: {
                    _id : {
                        year: {$year: "$createdAt"},
                        month: {$dateToString: { format: "%m", date: "$createdAt" }},
                    },
                    total: { $sum: '$itemId.price' },
                }
            },
            { $limit: 6 },
            {$sort: {'_id.year': -1, '_id.month': 1}},
        ]);
        const monthlyReport = earningMonthly.map(monthly => {
            return {year: monthly._id.year, month: moment(monthly._id.month, 'M').format('MMMM'), total: monthly.total}
        });

        res.render('admin/dashboard/index', {title: 'Dashboard', earningMonthAvg, earningYearTotal, totalBooking, totalBookingOutstanding, monthlyReport});
    }
}
