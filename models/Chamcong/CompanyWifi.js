

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanyWifiSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    com_id : {
        type: Number
    },
    name_wifi : {
        type: String
    },
    mac_address : {
        type: String
    },
    ip_address : {
        type: String
    },
    create_time : {
        type : Date,
        default : new Date()
    },
    is_default : {
        type: Number,
        default: 0
    },
    status : {
        type: Number,
        default :1
    },

    

});
module.exports = mongoose.model("CC365_CompanyWifi", CompanyWifiSchema);