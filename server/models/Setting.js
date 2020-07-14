const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    value: {
        type: String,
    },
    description: {
        type: String,
    },
}, {timestamps: true});

module.exports = mongoose.model('Setting', settingSchema);