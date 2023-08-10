const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SendNotificationSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    sn_payload: {
        type : String,

    },
    sn_filters: {
        type : String,

    },
    at_date: {
        type : Date,

    },
    at_time: {
        type : Date,

    },
    sn_type: {//Loại thông báo
        type : String,
        default : "default"
    },
    sn_status: {
        type : Number,
        default : 1
    },
    date_time_push: {
        type : Date,

    },
    sn_title: {
        type : String,
        default : 'Chấm công 365'
    },
    sn_content: {
        type : String,
        default : 'Thông báo mặc định'
    },

    

});
module.exports = mongoose.model("CC365_SendNotification", SendNotificationSchema);