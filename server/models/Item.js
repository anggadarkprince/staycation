const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Item name is required'],
        maxlength: [100, 'Item maximum 30 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        max: [99000000, 'Price maximum 99.000.000'],
    },
    country: {
        type: String,
        default: 'Indonesia',
        required: [true, 'Country is required'],
        maxlength: [50, 'Country maximum 50 characters'],
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        maxlength: [50, 'City maximum 50 characters'],
    },
    isPopular: {
        type: Boolean,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [5000, 'Description maximum 5000 characters'],
    },
    categoryId: {
        type: ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
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