const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuitJobSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    ep_id : {
        type : Number,
    },
    note : {
        type : String,
    },
    created_at : {
        type : Number,
    },

    

});
module.exports = mongoose.model("CC365_QuitJob", QuitJobSchema);