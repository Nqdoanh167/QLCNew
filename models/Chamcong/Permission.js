const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    com_id : {
        type : Number,

    },
    user_id : {
        type : Number,

    },
    permission_id : {
        type : String,

    },
    created_time : {
        type : Number,

    },

    

});
module.exports = mongoose.model("CC365_Permission", PermissionSchema);