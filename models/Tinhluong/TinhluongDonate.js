const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongDonateSchema = new Schema({
    don_id: {
        type: Number,
        default:0
    },
    don_id_user: {
        type: Number,
        default:0
    },
    don_name: {
        type: String,
        default:""
    },
    don_price:{
        type: Number,
        default:0
    },
    don_time_end:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    don_time_active:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    don_time_created:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
}, {
    collection: 'TinhluongDonate',
    versionKey: false,
    timestamp: true
});
// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongDonateSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongDonate", TinhluongDonateSchema).find({},
            {don_id:1}).sort({don_id:-1}).limit(1);
        if(maxId && maxId.length){
            maxId = maxId[0].don_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongDonateId'}, {$set:{Count:maxId}});
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
module.exports = connection.model("TinhluongDonate", TinhluongDonateSchema);