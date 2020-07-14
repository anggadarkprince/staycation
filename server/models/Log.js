const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const logSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
    },
    type: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    userAgent: {
        type: Object,
    },
    data: {
        type: Object,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('Log', logSchema);