const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appSchema = new Schema({
    _id:{
        type: Number,
    },
    name: {
        type: String,
  
    },
  
});

module.exports = mongoose.model("Application", appSchema);
