const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongThietLapSchema = new Schema({
    tl_id:{
        type: Number,
        require:true
    },
    tl_id_com: {
        type: Number,
        require:true
    },
    tl_id_rose: {
        type: Number,
        default:0
    },
    tl_name:{
        type: String,
        default:""
    },
    tl_money_min:{
        type: Number,
        default:0
    },
    tl_money_max:{
        type: Number,
        default:0
    },
    tl_phan_tram:{
        type: mongoose.Types.Decimal128,
        default:0
    },
    tl_chiphi:{
        type: Number,
        default:0
    },
    tl_hoahong:{
        type: Number,
        default:0
    },
    tl_kpi_yes:{
        type: Number,
        default:0
    },
    tl_kpi_no:{
        type: Number,
        default:0
    },
    tl_time_created:{
        type:String,
        default:new Date()
    },
},{
    collection: 'TinhluongThietLap',
    versionKey: false,
    timestamp: true
})


// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongThietLapSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongThietLap", TinhluongThietLapSchema).find({},
            {tl_id:1}).sort({tl_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].tl_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongThietLapId'}, {$set:{Count:maxId}});
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

module.exports = connection.model("TinhluongThietLap", TinhluongThietLapSchema); 