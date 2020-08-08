const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const memberSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
    },
    address: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('Member', memberSchema);
