const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    status: {
        type: String,
        required: true,
    },
    preferences: {
        type: Object,
    },
    tokens: [{
        type: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        expiredAt: {
            type: Date,
            required: true,
        },
    }],
    roleId: [{
        type: ObjectId,
        ref: 'Role',
    }],
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);