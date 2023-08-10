const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserUnsetSchema = new mongoose.Schema({
    _id: {
        type: Number
    },
    useMail: {
        type: String
    },
    usePhoneTk: {
        type: String
    },
    useFirstName: {
        type: String
    },
    usePass: {
        type: String
    },
    usePhone: {
        type: String
    },
    useCity: {
        type: Number
    },
    useQh: {
        type: Number
    },
    useAddr: {
        type: String
    },
    useCvTitle: {
        type: String
    },
    useCvCity: {
        type: String
    },
    useCvCate: {
        type: String
    },
    useCreateTime: {
        type: Date
    },
    useLink: {
        type: String
    },
    useActive: {
        type: Number
    },
    useDelete: {
        type: Number
    },
    type: {
        type: Number
    },
    empId: {
        type: Number
    },
    error: {
        type: Number
    },
    uRegis: {
        type: Number
    }


}, {
    collection: 'UserUnset',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("UserUnset", UserUnsetSchema);