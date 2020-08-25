const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 50,
    },
    username: {
        type: String,
        required: true,
        maxlength: 25,
    },
    email: {
        type: String,
        required: true,
        maxlength: 30,
        validate: {
            validator: function(v) {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: props => `${props.value} is not a valid email address`
        },
    },
    password: {
        type: String,
        minlength: 6,
    },
    avatar: {
        type: String,
        maxlength: 300,
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'SUSPENDED', 'ACTIVATED'],
    },
    preferences: {
        type: Object,
    },
    tokens: [{
        type: {
            type: String,
            required: true,
            enum: ['PASSWORD', 'REMEMBER', 'ACCESS_TOKEN', 'REFRESH_TOKEN'],
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
