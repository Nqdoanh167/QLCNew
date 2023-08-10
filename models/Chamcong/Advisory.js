
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdvisorySchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    adv_name : {
        type :String
    },
    adv_email : {
        type :String
    },
    adv_phone : {
        type :Number
    },
    adv_size_company : {
        type :String
    },
    adv_content : {
        type :String
    },
    adv_create_time : {
        type : Date
    },
    adv_is_resolve : {
        type :Number
    },

    

});
module.exports = mongoose.model("CC365_Advisory", AdvisorySchema);