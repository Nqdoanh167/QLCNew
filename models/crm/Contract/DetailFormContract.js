
//Model này dùng để 
const mongoose = require('mongoose')


const DetailFormContract = new mongoose.Schema({
    _id: {
        //id 
        type: Number,
        required: true
    },
    id_form_contract : {
        // id hợp đồng
        type : Number,
    },
    new_field : {
        // tên trường mặc định hoặc trường chứa chữ cái tìm kiếm
        type : String,
    },
    old_field : {
        // trường chữ cái tìm kiếm 
        type : String,
    },
    index_field : {
        // thứ tự chữ cái thay đổi 
        type : String,
    },
    default_field : {
        //thứ tự trong trường mặc định, nếu tạo trường mới thì index = 0
        type : Number,
    },
});

module.exports = mongoose.model('DetailFormContract', DetailFormContract);

