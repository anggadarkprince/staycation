const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
    },
    channel: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    url: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('Notification', notificationSchema);
