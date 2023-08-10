const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');

// hoa hồng cá nhân, nhóm ứng với từng đối tượng 
const TinhluongClassSchema = new Schema({
    cls_id: {
        type: Number,
        default:0
    },
    cls_id_cl: {
        type: Number,
        default:0
    },
    cls_id_user: {
        type: Number,
        default:0
    },
    cls_id_group:{
        type: Number,
        default:0
    },
    cls_id_com:{
        type: Number,
        default:0
    },
    cls_day:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    cls_day_end:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    cls_salary:{
        type: Number,
        default:0
    },
    cls_custom:{
        type: Number,
        default:0
    },
    cls_lydo:{
        type: String,
        default:""
    },
    cls_quyetdinh:{
        type: String,
        default:""
    },
    cls_phu_cap_bh:{
        type: Number,
        default:0
    },
    cls_time_created:{
        type: Date,
        default:new Date()
    },
}, {
    collection: 'TinhluongClass',
    versionKey: false,
    timestamp: true
});
// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongClassSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongClass", TinhluongClassSchema).find({},
            {cls_id:1}).sort({cls_id:-1}).limit(1);
        if(maxId && maxId.length){
            maxId = maxId[0].cls_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongClassId'}, {$set:{Count:maxId}});
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
module.exports = connection.model("TinhluongClass", TinhluongClassSchema);