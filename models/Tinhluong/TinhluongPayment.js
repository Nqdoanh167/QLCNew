const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongPaymentSchema = new Schema({
    pay_id:{
        type: Number,
        require:true
    },
    pay_com: {
        type: Number,
        require:true
    },
    pay_name: {
        type: String,
        default:""
    },
    pay_unit:{
        type: Number,
        default:0
    },
    pay_for_time:{
        type:Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    pay_time_start:{
        type:Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    pay_time_end:{
        type:Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
    pay_status:{
        type:Date,
        default:0
    },
    pay_for:{
        type:mongoose.Types.Decimal128,
        default:0
    },
},{
    collection: 'TinhluongPayment',
    versionKey: false,
    timestamp: true
})


// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongPaymentSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongPayment", TinhluongPaymentSchema).find({},
            {pay_id:1}).sort({pay_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].pay_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongPaymentId'}, {$set:{Count:maxId}});
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

module.exports = connection.model("TinhluongPayment", TinhluongPaymentSchema); 