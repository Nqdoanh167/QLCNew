const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogAccessSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    user_id : {
        type : Number,

    },
    type_use : {//1: là nhân viên, 2: là công ty'
        type : Number,

    },
    device_id : {
        type : Number,
        default : null
    },
    device_name : {
        type : String,
        default : null

    },
    access_token : {
        type : String,
        default : null

    },
    last_login : {
        type : String,
        default : 0

    },
    last_logout : {
        type : Number,
        default : 0

    },
    ip_address : {
        type : Number,
        default : null

    },
    os : {//1: Là từ nền tảng app, 2: là từ nền tảng web
        type : Number,
        default : 1
    },
    from_source : {
        type : Number,
        default : 'cc365'

    },
    device_lat : {
        type : Number,
        default : null

    },
    device_long : {
        type : Number,
        default : null

    },

    

});
module.exports = mongoose.model("CC365_LogAccess", LogAccessSchema);