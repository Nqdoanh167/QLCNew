
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotifyAppSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    user_id : {//ID chính nhận thông báo
        type : Number,
        default : null

    },
    affected_id : {//ID bị ảnh hưởng, ID nguồn tạo ra thông báo',
        type : Number,
        default : 0

    },
    not_image : {
        type : String,

    },
    not_desc : {
        type : String,
        default : null

    },
    user_type : {
        type : Number,

    },
    not_type : {//Loại thông báo. 1 là thông báo từ hệ thống, 2 là thông báo giữa các người dùng với nhau
        type : Number,

    },
    time_create : {
        type : Date,
        default : new Date()
    },
    not_active : {
        type : Number,

    },
    is_seen : {//Đã xem chưa
        type : Number,

    },
    url_notification : {//'URL để người dùng click (Nếu có)'
        type : Number,

    },

    

});
module.exports = mongoose.model("CC365_NotifyApp", NotifyAppSchema);