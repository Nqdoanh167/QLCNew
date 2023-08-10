
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanyWebIPSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    name_ip : {
        type : String
    },
    com_id : {
        type : Number
    },
    ip_address : {
        type : Number
    },
    type : {
        type : Number,
        default : 1
        //1 là ip dùng cho chấm công nhân viên, 2 là ip dùng cho chấm công công ty',
    },
    create_time : {
        type : Date,
        default : new Date()
    },
    is_default : {
        type : Number
    },
    status : {
        type : Number,
        default :1
    },

    

});
module.exports = mongoose.model("CC365_CompanyWebIP", CompanyWebIPSchema);