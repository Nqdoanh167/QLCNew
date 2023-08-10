const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongDetailPaymentSchema = new Schema({
    dp_id:{
        type: Number,
        require:true
    },
    dp_use_id: {
        type: Number,
        default:0
    },
    dp_money: {
        type: Number,
        default:0
    },
    dp_time:{
        type:Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    dp_pay_id:{
        type: Number,
        default:0
    },
    dp_com_id:{
        type: Number,
        default:0
    }
},{
    collection: 'TinhluongDetailPayment',
    versionKey: false,
    timestamp: true
})


// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongDetailPaymentSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongDetailPayment", TinhluongDetailPaymentSchema).find({},
            {dp_id:1}).sort({dp_id:-1}).limit(1);
        if(maxId && maxId.length){
            maxId = maxId[0].dp_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongDetailPaymentId'}, {$set:{Count:maxId}});
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

module.exports = connection.model("TinhluongDetailPayment", TinhluongDetailPaymentSchema); 