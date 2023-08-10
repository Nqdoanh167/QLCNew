const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const QuitJobSchema = new Schema({
    // id tu dong tang
    id: {
        type: Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    
    ep_id: {
        type: Number,
        required: true
    },

    com_id: {
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

    type: {
        type: Number,
        default: 0,
    },

    shift_id: {
        type: Number,
        default: 0,
    },
},{
    collection: 'HR_QuitJobs',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("HR_QuitJobs",QuitJobSchema);