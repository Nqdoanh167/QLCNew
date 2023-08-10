
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    ep_id: {
        type: Number
    },
    old_position_id: {
        type: Number
    },
    old_dep_id: {
        type: Number
    },
    decision_id: {
        type: Number
    },
    note: {
        type: String
    },
    created_at: {
        type: Number
    },

    

});
module.exports = mongoose.model("CC365_Appoint", AppointSchema);