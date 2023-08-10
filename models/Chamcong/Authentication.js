
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthenticationSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    otp: {
        type : Number
    },
    expired_time: {
        type : Date
    },
    create_time: {
        type : Date,
        default : new Date()
    },

    

});
module.exports = mongoose.model("CC365_Authentication", AuthenticationSchema);