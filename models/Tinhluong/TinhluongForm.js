const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongFormSchema = new Schema({
    fr_id:{
        type: Number,
        require:true
    },
    fr_id_lf: {
        type: Number,
        require:true
    },
    fr_class_off: {
        type: Number,
        require:true
    },
    fr_id_user:{
        type: Number,
        default:0
    },
    fr_user_name:{
        type: String,
        default:""
    },
    fr_room:{
        type: Number,
        default:0
    },
    ft_ca_nghi:{
        type: String,
        default:""
    },
    fr_fist_time:{
        type:Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    fr_ca_fist:{
        type: Number,
        default:0
    },
    fr_end_time:{
        type:Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    fr_ca_end:{
        type: Number,
        default:0
    },
    fr_price:{
        type: Number,
        default:0
    },
    fr_id_admin:{
        type: String,
        default:""
    },
    fr_admin_active:{
        type: String,
        default:""
    },
    fr_id_com:{
        type: Number,
        default:0
    },
    fr_file:{
        type: String,
        default:""
    },
    fr_why:{
        type: String,
        default:""
    },
    fr_note:{
        type: String,
        default:""
    },
    fr_phat:{
        type: Number,
        default:0
    },
    fr_status:{
        type: Number,
        default:0
    },
    active:{
        type: Number,
        default:0
    },
    fr_time_created:{
        type:Date,
        default:new Date()
    },
    fr_time_update:{
        type:Date,
        default:new Date()
    },
},{
    collection: 'TinhluongForm',
    versionKey: false,
    timestamp: true
})


// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongFormSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongForm", TinhluongFormSchema).find({},
            {fr_id:1}).sort({fr_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].fr_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongFormId'}, {$set:{Count:maxId}});
            console.log('Cập nhật counter')
            next();
        }
        else{
            return false;
        }
    }
    catch(e){
        return next(e);
    }
});

module.exports = connection.model("TinhluongForm", TinhluongFormSchema); 