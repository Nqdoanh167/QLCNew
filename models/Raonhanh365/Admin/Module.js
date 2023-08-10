const mongoose = require('mongoose');
const Schema = mongoose.Schema
const ModuleSchema = new mongoose.Schema({
    _id: {
        //id admin
        type: Number,
        require: true
    },
    name: {
        //kyword
        type: String,
        default: null
    },
    path: {
        //mật khẩu của admin,
        type: String,
        default: null
    },
    listName: {
        //mật khẩu của admin,
        type: String,
        default: null
    },
    listFile: {
        //tên admin
        type: String,
        default: null
    },
    order: {
        //tên admin
        type: Number,
        default: 0
    },
    help: {
        //tên admin
        type: String,
        default: null
    },
    langId: {
        //tên admin
        type: Number,
        default: null
    },
    checkLoca: {
        //tên admin
        type: Number,
        default: 0
    }
}, {
    collection: 'RN365_Module',
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model("RN365_Module", ModuleSchema);