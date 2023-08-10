const mongoose = require('mongoose');
const saveCandidateSchema = new mongoose.Schema(
    {
        _id:{
            type: Number,
            required: true,
        },
        // id company
        uscID: {
            type: Number,
            required: true
        },
        //id  ứng viên
        userID: {
            type: Number,
            default: 0
        },
        // thời gian lưu
        saveTime: {
            type: Date,
            required: true
        }
    },
    { collection: 'SaveCandidate',  
    versionKey: false , 
    timestamp:true
  }  
  )
  module.exports = mongoose.model("SaveCandidate", saveCandidateSchema);

