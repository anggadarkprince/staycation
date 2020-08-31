const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const bookingSchema = new mongoose.Schema({
    transactionNumber: {
        type: String,
        required: true,
    },
    bookingStartDate: {
        type: Date,
        required: true,
    },
    bookingEndDate: {
        type: Date,
        required: true,
    },
    itemId: {
        _id: {
            type: ObjectId,
            ref: 'Item',
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        }
    },
    userId: {
        type: ObjectId,
        ref: 'User',
    },
    bankId: {
        type: ObjectId,
        ref: 'Bank',
    },
    payment: {
        proofPayment: {
            type: String,
        },
        paymentMethod: {
            type: String,
            default: 'BANK TRANSFER',
        },
        bank: {
            type: String,
        },
        accountHolder: {
            type: String,
        },
        accountNumber: {
            type: String,
        },
        paidAt: {
            type: Date,
        },
    },
    review: {
        type: String,
    },
    rating: {
        type: Number,
    },
    reviewImage: {
        type: String,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        required: true,
        default: 'BOOKED',
    }
}, {timestamps: true});

module.exports = mongoose.model('Booking', bookingSchema);
