const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const TinhluongListNghiPhepSchema = new Schema({
    of_id:{
        type: Number,
        require:true
    },
    of_name: {
        type: String,
        default:""
    },
    of_note: {
        type: String,
        default:""
    },
    of_active:{
        type: Number,
        default:0
    },
    of_time_created:{
        type:Date,
        default:new Date()
    },
},{
    collection: 'TinhluongListNghiPhep',
    versionKey: false,
    timestamp: true
})


// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongListNghiPhepSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongListNghiPhep", TinhluongListNghiPhepSchema).find({},
            {of_id:1}).sort({of_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].of_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongListNghiPhepId'}, {$set:{Count:maxId}});
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


module.exports = connection.model("TinhluongListNghiPhep", TinhluongListNghiPhepSchema); 