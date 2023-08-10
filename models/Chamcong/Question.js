

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    question : {
        type : String,

    },
    answer : {
        type : String,

    },
    q_active : {
        type : Number,

    },
    from_site : {
        type : String,

    },
    time_create : {
        type : Number,

    },

    

});
module.exports = mongoose.model("CC365_Question", QuestionSchema);