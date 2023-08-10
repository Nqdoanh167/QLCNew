const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    user_id : {
        type : Number,

    },
    device_id : {
        type : String,

    },
    update_time : {
        type : Date,
        default : new Date()

    },
    refresh_token : {
        type : String,

    },
    type_user : {//1: là nhân viên, 2: là công ty'
        type : Number,

    },
    os : {//'1: Là từ nền tảng app, 2: là từ nền tảng web'
        type : Number,

    },
    from_source : {
        type : String,
        default : 'cc365'

    },


    

});
module.exports = mongoose.model("CC365_RefreshToken", RefreshTokenSchema);