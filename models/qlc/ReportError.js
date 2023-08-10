const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportError = new Schema({
    _id: {//ID danh sách bao loi
        type: Number,
    },
    idQLC: {
        type: Number
    },
    curDeviceId: {//ID thiet bi
        type: String
    },
    type: {// kieu user
        type: Number
    },
    detail_error: {//chi tiet loi
        type: String
    },
    gallery_image_error: {//anh
        type: String,
    },

    createdAt: {//thời điểm tao
        type: String,
    },
    from_source: { //nguon
        type: Number,
    },
})

module.exports = mongoose.model('ReportError', ReportError);