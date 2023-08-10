
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeHistorySchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    hs_ep_id : {
        type : Number,
    },
    hs_com_id : {
        type : Number,
    },
    hs_dep_id : {
        type : Number,
    },
    hs_group_id : {
        type : Number,
    },
    hs_resign_id : {
        type : Number,
    },
    hs_time_start : {
        type : Date,
        default : new Date()
    },
    hs_time_end : {
        type : Date,
        default : null
    },

    

});
module.exports = mongoose.model("CC365_EmployeeHistory", EmployeeHistorySchema);