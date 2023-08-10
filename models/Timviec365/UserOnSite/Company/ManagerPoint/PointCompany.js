const mongoose = require('mongoose');
const pointCompanySchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    uscID: Number,
    point: {
        type: Number,
        required: true,
    },
    pointUSC: {
        type: Number,
        required: true,
    },
    pointBaoLuu: {
        type: Number,
        required: true,
    },
    chuThichBaoLuu: String,
    dayResetPoint: Date,
    dayResetPoint0: Date,
}, {
    collection: 'PointCompany',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("PointCompany", pointCompanySchema);