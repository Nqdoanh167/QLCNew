const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FirebaseTokenSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    ft_token : {
        type : String,

    },
    user_id : {
        type : Number,

    },
    type_user : {//1: là công ty, 2: là nhân viên
        type : Number,

    },
    ft_uuid : {
        type : String,

    },
    ft_device_id : {//là id thiết bị',
        type : String,

    },
    from_source : {
        type : Number,
        default : 'cc365'

    },

    

});
module.exports = mongoose.model("CC365_FirebaseToken", FirebaseTokenSchema);