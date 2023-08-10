const mongoose = require('mongoose')


const setipShema = new mongoose.Schema({

    _id:{// id cài đặt ip
        type: Number,
        default : true
    // },
    // idQLC: {// id user
    //     type : Number,
    },
    com_id :{// id công ty
        type: Number,
    },
    accessIP :{//địa chỉ ip
        type :String,
    },
    fromSite : {// site cài IP 
        type: String,
    },
    // nameApp: { // ứng dụng cài đặt IP
    //     type: String,
    // },
    createAt: {//thời điểm tạo
        type: Date,
        default : Date.now()
    },
    updateAt : {//o là chưa up date lần nào
        tpye: Date,
    }    
});
module.exports = mongoose.model('settingIP', setipShema)