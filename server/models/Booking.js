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
        night: {
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
    proofPayment: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        default: 'BANK TRANSFER',
    },
    bank: {
        type: String,
        required: true,
    },
    accountHolder: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('Booking', bookingSchema);