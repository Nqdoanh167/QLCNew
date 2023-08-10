const mongoose = require('mongoose')
const CheckDevice = new mongoose.Schema({
    //Id bảng
    _id : {
        type : Number,
        required : true 
    },
    //Id người dùng
    idQLC: {
        type : Number
    },
    //Id của công ty
    companyId: {
        type: Number
    },
    //Id phòng ban 
    depID: {
        type : Number
    },
    // // ID thiết bị hiện tại 
    curDevice :{
        type : String
    },
    //tên thiết bị hiện tại
    curDeviceName:{
        type : String
    },
    //ID thiết bị mới 
    newDevice :{
        type : String
    },
    typeDevice :{
        type : Number
    },
    //tên thiết bị mới 
    newDeviceName:{
        type : String
    },
    //Thời điểm tạo 
    createdAt: {
        type: Date,
        default: Date.now()
    },

})

module.exports = mongoose.model('CheckDevice',CheckDevice)