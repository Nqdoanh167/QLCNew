const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CalendarSchema = new Schema({
    //Id lịch làm việc
    _id: {
        type: Number,
        // require: true
    },
    // ID của công ty tạo lịch làm việc
    companyID: {
        type: Number,
    },
    // ID ca lam viec
    shiftID: {
        type: Number,
        
    },
    //Tên của lịch làm việc
    calendarName: {
        type: String,
    },
    //Thời điểm tạo lịch làm việc
    createdAt: {
        type: Date,
        default: Date.now()
    },
    //Id lịch làm việc
    //1: Thứ 2 - thứ 6, 2: Thứ 2 - thứ 7, 3: Thứ 2 - thứ CN
    idCalendarWork: {
        type: Number
    },
    //Lịch làm việc
    workCalendar: {
        type: String
    },
    //Thời gian áp dụng (theo tháng)
    timeApply: {
        type: Date
    },
    //Ngày bắt đầu áp dụng 
    timeStart: {
        type: Date
    },
    //Có phải copy
    isCopy: {
        type: Boolean
    },
    //Thời điềm copy nền không phải copy thì là null
    timeCopy: {
        type: Date
    },
    // Lịch chi tiết cho từng ngày
    calendarDetail: {
        type: [{
            type:Schema.Types.ObjectId,
            ref: 'ShiftCalendars'
        }]
    }

});

module.exports = mongoose.model("Calendars", CalendarSchema);