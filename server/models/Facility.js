const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const facilitySchema = new mongoose.Schema({
    facility: {
        type: String,
        required: [true, 'Facility required'],
        maxlength: [50, 'Facility maximum 50 characters'],
    },
    description: {
        type: String,
        maxlength: [200, 'Description maximum 200 characters'],
    },
    image: {
        type: String,
        required: true,
    },
    itemId: [{
        type: ObjectId,
        ref: 'Item',
    }],
}, {timestamps: true});

module.exports = mongoose.model('Facility', facilitySchema);
