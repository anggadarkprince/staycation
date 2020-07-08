const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
}, {timestamps: true});

module.exports = mongoose.model('Category', categorySchema);