
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeDeviceSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    ep_id : {
        type : Number,
    },
    current_device : {
        type : String,
    },
    current_device_name : {
        type : String,
        default : null
    },
    new_device : {
        type : String,
        default : null
    },
    new_device_name : {
        type : String,
        default : null
    },
    create_time : {
        type : Date,
        default : new Date()
    },
    type_device : {
        type : Number,
        default : 0
    },

    

});
module.exports = mongoose.model("CC365_EmployeeDevice", EmployeeDeviceSchema);