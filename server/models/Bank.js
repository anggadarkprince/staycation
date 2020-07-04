const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    bank: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: Number,
        required: true,
    },
    accountHolder: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Bank', bankSchema);