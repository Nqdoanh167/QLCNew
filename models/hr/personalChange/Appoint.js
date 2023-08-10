const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AppointSchema = new Schema({
    // id tu dong tang
    id: {
        type: Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    
    com_id: {
        type: Number,
        required: true
    },

    ep_id: {
        type: Number,
        required: true
    },
    
    current_position: {
        type: Number,
        default: 0,
    },
    
    current_dep_id: {
        type: Number,
        default: 0,
    },
    
    update_position: {
        type: Number,
        require: true,
    },
    
    update_dep_id: {
        type: Number,
        require: true
    },
    
    created_at: {
        type: Date,
        require: true,
        default: null
    },
    
    decision_id: {
        type: Number,
        default: 0,
    },
    // ly do
    note: {
        type: String,
        default: null,
    },
},{
    collection: 'HR_Appoints',
    versionKey: false,
    timestamp: true
});
AppointSchema.index({ep_id:1,com_id:1})
module.exports = mongoose.model("HR_Appoints",AppointSchema);