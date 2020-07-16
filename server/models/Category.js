const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, 'Category required'],
        maxlength: [30, 'Category maximum 30 characters'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description maximum 500 characters'],
    },
}, {timestamps: true});

module.exports = mongoose.model('Category', categorySchema);