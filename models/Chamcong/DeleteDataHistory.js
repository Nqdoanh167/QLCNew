
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeleteDataHistorySchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    dl_com_id : {
        type : Number,
    },
    dl_user_id : {//Nhân sự xóa
        type : Number,
    },
    dl_dep_id : {//Phòng ban của nhân sự tại thời điểm xóa
        type : Number,
    },
    dl_time : {//Tháng xóa
        type : Date,
    },
    dl_web : {//'web bị xóa dữ liệu
        type : String,
    },
    dl_data : {//data thuộc web xóa dữ liệu
        type : String,
    },
    dl_note : {
        type : String,
    },
    dl_create_time : {//Thời điểm xóa
        type : Date,
        default : new Date()
    },

    

});
module.exports = mongoose.model("CC365_DeleteDataHistory", DeleteDataHistorySchema);