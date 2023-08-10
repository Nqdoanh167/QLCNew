const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RolesSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    group_id : {
        type : Number,

    },
    org_id : {
        type : Number,
        default : null

    },
    role_name : {
        type : String,
        default : null

    },
    description : {
        type : String,
        default : null

    },
    rank : {
        type : Number,
        default : 0

    },
    rights : {
        type : String,

    },
    status : {
        type : Number,
        default : 1

    },

    

});
module.exports = mongoose.model("CC365_Roles", RolesSchema);