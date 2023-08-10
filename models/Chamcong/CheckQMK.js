
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CheckQMKSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    qmk_use_id : {
        type: Number
    },
    qmk_type : {
        type: Number
    },
    qmk_time : {
        type: Date
    },
    
    

});
module.exports = mongoose.model("CC365_CheckQMK", CheckQMKSchema);