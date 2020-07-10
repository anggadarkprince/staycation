const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const roleSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    permissionId: [{
        type: ObjectId,
        ref: 'Permission',
        required: true,
    }],
}, {timestamps: true});

module.exports = mongoose.model('Role', roleSchema);