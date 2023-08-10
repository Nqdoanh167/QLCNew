const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    name: {
        // tên ngành nghề
        type: String,
        required: true
    },
    title: {
        // tiêu đề
        type: String,
        default: null
    },
    tags: {
        // name tag
        type: String,
        default: null
    },
    seoDescription: {
        // chi tiết 
        type: String,
        default: null
    },
    seoKeyword: {
        // từ khóa
        type: String,
        default: null
    },
    description: {
        // mô tả
        type: String,
        default: null
    },
    parentID: {
        // id cha
        type: Number,
        default: 0
    },
    countCandi: {
        // tổng ứng viên của ngành nghề
        type: Number,
        default: 0
    },
    countJob: {
        // tổng việc làm của ngành nghề
        type: Number,
        default: 0
    },
    order: {
        // ưu tiên
        type: Number,
        default: 0
    },
    active: {
        // kích hoạt
        type: Number,
        default: 0
    },
    hot: {
        // 
        type: Number,
        default: 0
    },
    cat_ut: {
        // 
        type: String,
        default: null
    },
    cat_only: {
        // 
        type: Number,
        default: 0
    },
    cat_except: {
        // 
        type: String,
        default: null
    },
    cat_tlq: {
        // 
        type: String,
        default: null
    },
    cat_name_new: {
        // 
        type: String,
        default: null
    },
    cat_order_show: {
        // 
        type: Number,
        default: null
    },
}, {
    collection: 'CategoryJob',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("CategoryJob", jobSchema);