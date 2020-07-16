const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    bank: {
        type: String,
        required: [true, 'Bank name required'],
        maxlength: [30, 'Bank name maximum 30 characters'],
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number required'],
        maxlength: [25, 'Account number maximum 25 characters'],
    },
    accountHolder: {
        type: String,
        required: [true, 'Account holder name required'],
        maxlength: [25, 'Account holder maximum 25 characters'],
    },
    logo: {
        type: String,
        maxlength: 300,
    },
    description: {
        type: String,
        maxlength: [500, 'Description maximum 500 characters'],
    },
}, {timestamps: true});

module.exports = mongoose.model('Bank', bankSchema);