const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const logSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'Member',
    },
    type: {
        type: String,
        required: true,
    },
    data: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('Log', logSchema);