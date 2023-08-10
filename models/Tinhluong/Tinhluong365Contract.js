const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const Tinhluong365ContractSchema = new Schema({
    con_id: {
        type: Number,
        default:0
    },
    con_id_user: {
        type: Number,
        default:0
    },
    con_name: {
        type: String,
        default:""
    },
    con_time_up:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    con_time_end:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    con_file:{
        type: String,
        default:""
    },
    con_salary_persent:{
        type: Number,
        default:""
    },
    con_time_created:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    }
}, {
    collection: 'Tinhluong365Contract',
    versionKey: false,
    timestamp: true
});
// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
Tinhluong365ContractSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("Tinhluong365Contract", Tinhluong365ContractSchema).find({},{con_id:1}).sort({con_id:-1}).limit(1);
        if(maxId && maxId.length){
            maxId = maxId[0].con_id + 1;
            await Counter.findOneAndUpdate({TableId: 'Tinhluong365ContractId'}, {$set:{Count:maxId}});
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
module.exports = connection.model("Tinhluong365Contract", Tinhluong365ContractSchema);