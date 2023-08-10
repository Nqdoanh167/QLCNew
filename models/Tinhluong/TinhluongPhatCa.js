const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongPhatCaSchema = new Schema({
    pc_id: {
        type: Number,
        default:0
    },
    pc_money: {
        type: Number,
        default:0
    },
    pc_time: {
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    pc_shift:{
        type: Number,
        default:0
    },
    pc_com:{
        type: Number,
        default:0
    },
    pc_type:{
        type: Number,
        default:0
    },
}, {
    collection: 'TinhluongPhatCa',
    versionKey: false,
    timestamp: true
});
// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongPhatCaSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongPhatCa", TinhluongPhatCaSchema).find({},
            {pc_id:1}).sort({pc_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].pc_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongPhatCaId'}, {$set:{Count:maxId}});
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
module.exports = connection.model("TinhluongPhatCa", TinhluongPhatCaSchema);