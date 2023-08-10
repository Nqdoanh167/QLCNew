const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongPhatMuonSchema = new Schema({
    pm_id: {
        type: Number,
        require:true
    },
    pm_id_com: {
        type: Number,
        require:true
    },
    pm_shift: {
        type: Number,
        require:true
    },
    pm_type:{
        type: Number,
        require:true
    },
    pm_minute:{
        type: Number,
        require:true
    },
    pm_type_phat:{
        type: Number,
        require:true
    },
    pm_time_begin:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    pm_time_end:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    pm_monney:{
        type: Number,
        require:true
    },
    pm_time_created:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    }
}, {
    collection: 'TinhluongPhatMuon',
    versionKey: false,
    timestamp: true
});
// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongPhatMuonSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongPhatMuon", TinhluongPhatMuonSchema).find({},
            {pm_id:1}).sort({pm_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].pm_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongPhatMuonId'}, {$set:{Count:maxId}});
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
module.exports = connection.model("TinhluongPhatMuon", TinhluongPhatMuonSchema);