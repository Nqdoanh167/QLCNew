const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
    //ID của tổ
    _id: {
        type: Number,
        required: true
    },
    //ID phòng ban của tổ
    dep_id: {
        type: Number,
    },

    com_id: {
        type : Number,
    },
    //Tên của tổ
    teamName: {
        type: String,
    },

    //Ngày thành lập tổ
    teamCreated: {
        type: Date,
        default: Date.now()
    },

    //ID quản lý tổ
    managerTeamId: {
        type: Number
    },
    //ID phó tổ
    deputyTeamId: {
        type: Number
    },

    //Sắp xếp theo thứ tự
    teamOrder: {
        type: Number
    },
    // tổng số nhân viên 
    total_emp : {
        type :Number,
    }
})

module.exports = mongoose.model('Teams', TeamSchema)