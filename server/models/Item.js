const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Item required'],
        maxlength: [100, 'Item maximum 30 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Price required'],
        max: [99000000, 'Price maximum 99.000.000'],
    },
    country: {
        type: String,
        default: 'Indonesia',
        required: [true, 'Country required'],
        maxlength: [50, 'Country maximum 50 characters'],
    },
    city: {
        type: String,
        required: [true, 'City required'],
        maxlength: [50, 'City maximum 50 characters'],
    },
    isPopular: {
        type: Boolean,
    },
    description: {
        type: String,
        required: [true, 'Description required'],
        maxlength: [5000, 'Description maximum 5000 characters'],
    },
    categoryId: {
        type: ObjectId,
        ref: 'Category',
    },
    imageId: [{
        type: ObjectId,
        ref: 'Image',
    }],
    featureId: [{
        type: ObjectId,
        ref: 'Feature',
    }],
    activityId: [{
        type: ObjectId,
        ref: 'Activity',
    }],
}, {timestamps: true});

module.exports = mongoose.model('Item', itemSchema);