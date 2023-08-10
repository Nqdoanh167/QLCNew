const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupsSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    dep_id : {
        type : Number,
    },
    gr_name : {
        type : String,
    },
    parent_gr : {
        type : Number,
        default : 0
    },

    

});
module.exports = mongoose.model("CC365_Groups", GroupsSchema);