const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const LevelCompanySchema = new Schema({
    _id: {
        type: Number
    },
    com_id: {
        type: Number
    },
    level: {
        type: Number
    },
    name: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    },
});
module.exports = mongoose.model("QLCN_LevelsCompany", LevelCompanySchema);