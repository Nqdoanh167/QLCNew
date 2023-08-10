const mongoose = require('mongoose');
const pointUsedSchema = new mongoose.Schema({
    usc_id: {
        type: Number,
    },
    use_id: {
        type: Number,
    },
    point: {
        type: Number,
    },
    type: {
        type: Number,
    },
    type_err: {
        type: Number,
        default: 0
    },
    note_uv: {
        type: String,
        default: null
    },
    used_day: {
        type: Number
    },
    return_point: {
        type: Number,
        default: 0
    },
    admin_id: {
        type: Number,
        default: 0
    },
    ip_user: {
        type: String,
    },
}, {
    collection: 'PointUsed',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("PointUsed", pointUsedSchema);