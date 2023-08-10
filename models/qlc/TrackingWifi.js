const mongoose = require('mongoose')
const Schema = mongoose.Schema;
//lấy danh sách vị trí công ty chấm công bằng QR
const TrackingWifi = new Schema({
    //ID của chấm công QR
    _id: {
        type: Number,
        required: true
    },
    //id công ty
    companyID: {
        type : Number,
    },
    nameWifi:{
        // tên wifi
        type : String
    },
    CreateAt:{
        //thời điểm tạo 
        type : Date,
        default : Date.now()
    },
    IPaddress: {
        type: String
    },

    MacAddress: {
        type: String
    },

    isDefaul: {
        type: Number || 0
    },

    status : {
        type: Number
    },
})

module.exports = mongoose.model('TrackingWifi', TrackingWifi)
