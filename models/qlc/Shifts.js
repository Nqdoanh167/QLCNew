const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShiftSchema = new Schema({
    //Id của ca làm việc
    _id: {
        type: Number,
    },
    //Id của công ty
    companyID: {
        type: Number
    },
    //Thời điểm tạo ca làm việc
    createdAt: {
        type: Date,
        default: Date.now()
    },
    //Tên ca làm việc
    shiftName: {
        type: String,
    },
    //Giờ vào ca
    timeCheckIn: {
        type: String
    },
    //Giờ hết ca
    timeCheckOut: {
        type: String
    },
    //Giớ check in sớm nhất
    timeCheckInEarliest: {
        type: String
    },
    //Giớ check out muộn nhất
    timeCheckOutLastest: {
        type: String
    },
    //Id hình thức tính công
    idTypeCalculateWork: {
        type: Number,
    },
    //Hình thức tính công
    typeCalculateWork: {
        type: String
    },
    //Số công theo ca
    numOfWorkPerShift: {
        type: Number
    },
    //Số tiền theo ca
    money: {
        type: Number
    },
    over_night: {
        type: Number
    },
    is_overtime: {
        type: Number
    },
    status: {
        type: Number
    },
    
})

module.exports = mongoose.model("Shifts", ShiftSchema); 