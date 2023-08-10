const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SalarySchema = new Schema({
    // id tu dong tang
    id: {
        type: Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    
    idUser: {
        type: Number,

    },
    
    comId: {
        type: Number,

    },
    
    salaryBasic: {
        type: Number,

    },
    
    salaryBh: {
        type: String,

    },
    
    pcBh: {
        type: Number,

    },
    
    timeUp: {
        type: Date,

    },
    
    location: {
        type: Number,

    },
    
    lydo: {
        type: String,
    },
    quyetdinh: {
        type: String,
        
    },
    first: {
        type: Number,
        
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
},{
    collection: 'HR_Salarys',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("HR_Salarys",SalarySchema);
