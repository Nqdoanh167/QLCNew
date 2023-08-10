const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CalendarWorkEmployee = new Schema({
    _id: {//ID danh sách nhân viên có lịch làm việc
        type: Number,
        required: true
    },
    idQLC: {
        type: Number
    },
    companyID: {//ID cty
        type: Number
    },
    shiftID: {//ID ca 
        type: Number
    },
    calendarID: {//ID lịch làm việc
        type: Number
    },
    calendarName: {//ID lịch làm việc
        type: String,
    },

    timeApply: {//thời điểm áp dụng
        type: Date
    },
    Detail: { //chi tiết
        type: String
    },
    Status: { //chua biet
        type: String
    },
    isPersonal: { //chua biet
        type: String
    },
})

module.exports = mongoose.model('CalendarWorkEmployee', CalendarWorkEmployee);