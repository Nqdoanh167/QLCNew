const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    //ID của nhóm
    _id: {
        type: Number,
        required: true
    },

    //ID tổ của nhóm
    team_id: {
        type: Number,
    },

    //ID cty
    com_id: {
        type: Number,
    },

    //ID phong của nhóm
    dep_id: {
        type: Number,
    },

    // Tên của nhóm
    groupName: {
        type: String,
    },

    //Ngày thành lập nhóm
    groupCreated: {
        type: Date,
        default: Date.now()
    },

    //ID quản lý nhóm
    managerId: {
        type: Number
    },

    //ID pho quan ly nhom
    deputyManagerId: {
        type: Number
    },

    //so luong thanh vien
    numberMember: {
        type: Number,
        default: 0
    },

    //Sắp xếp theo thứ tự
    parentGroup: {
        type: Number
    },
    // tổng số nhân viên 
    total_emp : {
        type :Number,
    }
})

module.exports = mongoose.model('Groups', GroupSchema)