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
    roleId: [{
        type: ObjectId,
        ref: 'Role',
        required: true,
    }],
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);