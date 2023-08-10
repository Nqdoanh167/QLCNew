

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TranferJobSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    ep_id : {
        type : Number,

    },
    com_id : {
        type : Number,

    },
    dep_id : {
        type : Number,

    },
    position_id : {
        type : Number,

    },
    decision_id : {
        type : Number,

    },
    note : {
        type : String,

    },
    mission : {
        type : String,

    },
    created_at : {
        type : Number,

    },

    

});
module.exports = mongoose.model("CC365_TranferJob", TranferJobSchema);