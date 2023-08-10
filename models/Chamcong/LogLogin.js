const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogLoginSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    type_use : {//1: là nhân viên, 2: là công ty
        type : Number,

    },
    device_id : {
        type : String,
        default : null

    },
    device_name : {
        type : String,
        default : null

    },
    last_login : {
        type : Number,
        default : 0

    },
    last_logout : {
        type : Number,
        default : 0


    },
    ip_address : {
        type : String,
        default : null

    },
    device_lat : {
        type : String,
        default : null

    },
    device_long : {
        type : String,
        default : null

    },

    

});
module.exports = mongoose.model("CC365_LogLogin", LogLoginSchema);