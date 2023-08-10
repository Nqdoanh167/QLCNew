const mongoose = require('mongoose');
const Schema = mongoose.Schema
const NetworkOperatorSchema = new mongoose.Schema({
    _id: {
        //id nhà mạng
        type: Number,
        required: true,
    },
    nameBefore: {
        //tên nhà mạng khi nạp tiền
        type: String,
        default: null
    },
    nameAfter: {
        //tên nhà mạng khi lấy ra
        type: String,
        default: null
    },
    discount: {
        //chiết khấu % sau khi nạp tiền
        type: Number,
        default: 0
    },
    priceListActive: {
        //bảng giá hoạt động
        type: Number,
        default: 0
    }

}, {
    collection: 'RN365_NetworkOperator',
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model("RN365_NetworkOperator", NetworkOperatorSchema);