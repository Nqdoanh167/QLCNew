const mongoose = require('mongoose')
const HisOfTracking = new mongoose.Schema({
    //id nhaan vieen
    _id: {
        type: Number,
        required: true
    },
    idQLC: {
        type: Number
    },
    imageTrack: {
        type: String,
        default: null
    },
    curDeviceName: {
        type: String
    },
    latitude: {
        // Tọa độ lat
        type: String,
        default: null
    },
    longtitude: {
        // Tọa độ long
        type: String,
        default: null
    },
    Location: {
        //vị trí
        type: String
    },
    CreateAt: {
        //thời điểm chấm công 
        type: Date,
        default: Date.now()
    },
    NameWifi: {
        //tên wifi
        type: String
    },
    IpWifi: {
        //ip wifi
        type: String
    },
    MacWifi: {
        //mac wifi
        type: String
    },
    shiftID: {
        //id ca làm việc
        type: Number
    },
    companyID: {
        //id công ty
        type: Number
    },
    depID: {
        //id công ty
        type: Number
    },
    Note: {
        //note
        type: String
    },
    BluetoothAdrr: {
        //địa chỉ bluetooth
        type: String
    },
    role: {
        //vai trò
        type: Number
    },
    status: {
        //trạng thái của công: 1 là công chấm mặt, 2 là công chấm QR, 3 là bù công',
        type: Number
    },
    Err: { //trạng thái thất bại
        type: String,
    },
    Success: { //trạng thái Thành công
        type: String,
    },


})

module.exports = mongoose.model("HistoryOfTracking", HisOfTracking)