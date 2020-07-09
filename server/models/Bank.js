const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    bank: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    accountHolder: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
    },
    description: {
        type: String,
    },
}, {timestamps: true});

module.exports = mongoose.model('Bank', bankSchema);