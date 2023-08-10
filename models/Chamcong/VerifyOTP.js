const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VerifyOTPSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    user_email : {
        type : Number,

    },
    otp_code : {
        type : Number,

    },
    time_expired : {
        type : Date,

    },
    time_create : {
        type : Date,
        default : new Date()

    },
    type_user : {//'1: Là nhân viên, 2: công ty'
        type : Number,

    },

    

});
module.exports = mongoose.model("CC365_VerifyOTP", VerifyOTPSchema);