const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    isPrimary: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Image', imageSchema);