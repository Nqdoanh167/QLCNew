const mongoose = require('mongoose');
const moduleSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    name: String,
    path: String,
    listName: String,
    listFile: String,
    order: String,
    help: String,
    langID: {
        type: Number,
        default: 1
    },
    checkLoca: {
        type: Number,
        default: 0
    }
}, {
    collection: 'Modules',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("Modules", moduleSchema);