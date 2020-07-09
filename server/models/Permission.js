const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    permission: {
        type: String,
        required: true,
    },
    module: {
        type: String,
        required: true,
    },
    submodule: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
}, {timestamps: true});

module.exports = mongoose.model('Permission', permissionSchema);