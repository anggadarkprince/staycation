const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const roleSchema = new mongoose.Schema({
    role: {
        type: String,
        required: [true, 'Role required'],
        maxlength: [30, 'Role maximum 30 characters'],
    },
    description: {
        type: String,
    },
    permissionId: [{
        type: ObjectId,
        ref: 'Permission',
        required: [true, 'Permissions required'],
    }],
}, {timestamps: true});

module.exports = mongoose.model('Role', roleSchema);