const mongoose = require('mongoose');
const adminUserRightSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    adminID: {
        type: Number,
    },
    adminModule: {
        type: Number,
    },
    add: {
        type: Number,
        default: 0,
    },
    edit: {
        type: Number,
        default: 0,
    },
    delete: {
        type: Number,
        default: 0,
    }
}, {
    collection: 'AdminUserRight',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("AdminUserRight", adminUserRightSchema);