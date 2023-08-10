
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanyCoordinateSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    com_id : {
        type: Number
    },
    cor_location_name : {
        type: String
    },
    cor_lat : {
        type: Number
    },
    cor_long : {
        type: Number
    },
    cor_radius : {
        type: Number
    },
    cor_create_time : {
        type: Date,
        default : new Date()
    },
    is_default : {
        type: Number
    },
    status : {
        type: Number
    },
    qr_logo : {
        type: String
    },
    qr_status : {
        type: Number
    },

    

});
module.exports = mongoose.model("CC365_CompanyCoordinate", CompanyCoordinateSchema);