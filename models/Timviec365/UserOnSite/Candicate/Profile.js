// hồ sơ
const mongoose = require('mongoose');
const ProfileSchema = new mongoose.Schema({
    hs_id: {
        type: Number,
        require: true,
        unique: true,
        autoIncrement: true
    },
    hs_use_id: {
        type: Number,
        require: true,
    },
    hs_name: {
        // Tên của file được lưu lại
        type: String,
    },
    hs_link: {
        // Đường dẫn cv không che thông tin
        type: String
    },
    hs_cvid: {
        // Đường dẫn cv và đường dẫn cv che thông tin email,sđt khi tạo cv
        type: String,
    },
    hs_create_time: {
        type: Number,
        default: 0
    },
    hs_active: {
        type: Number,
        default: 0
    },
    hs_link_hide: {
        type: String,
    },
    is_scan: {
        type: Number,
        default: 0
    },
    hs_link_error: {
        type: String,
    },
    state: {
        type: Number,
        default: 0
    },
    mdtd_state: {
        type: Number,
        default: 0
    },
    scan_cv: {
        type: Number,
        default: 0
    }
}, {
    collection: 'Profile',
    versionKey: false
});

module.exports = mongoose.model("Profile", ProfileSchema);