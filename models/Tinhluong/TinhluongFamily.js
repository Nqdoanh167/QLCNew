const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongFamilySchema = new Schema({
    fa_id: {
        type: Number,
        default:0
    },
    fa_id_user: {
        type: Number,
        default:0
    },
    fa_name: {
        type: String,
        default:""
    },
    fa_birthday:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    fa_phone:{
        type: String,
        default:""
    },
    fa_relation:{
        type: String,
        default:""
    },
    fa_job:{
        type: String,
        default:""
    },
    fa_address:{
        type: String,
        default:""
    },
    fa_status:{
        type: String,
        default:""
    },
    fa_active:{
        type: String,
        default:""
    },
    fa_time_created:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    }
}, {
    collection: 'TinhluongFamily',
    versionKey: false,
    timestamp: true
});
// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongFamilySchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongFamily", TinhluongFamilySchema).find({},
            {fa_id:1}).sort({fa_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].fa_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongFamilyId'}, {$set:{Count:maxId}});
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
module.exports = connection.model("TinhluongFamily", TinhluongFamilySchema);