
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WayTimekeepingSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    
    way_name : {
        type : String,
    }
    

});
module.exports = mongoose.model("CC365_WayTimekeeping", WayTimekeepingSchema);