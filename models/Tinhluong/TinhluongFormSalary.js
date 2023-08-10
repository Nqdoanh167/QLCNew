const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');

// lưu các loại form lương 
const TinhluongFormSalarySchema = new Schema({
    fs_id:{
        type: Number,
        require:true
    },
    fs_id_com: {
        type: Number,
        default:0
    },
    fs_type: {
        type: Number,
        default:0
    },
    fs_name:{
        type: String,
        default:""
    },
    fs_data:{
        type: Number,
        default:0
    },
    fs_repica:{
        type: String,
        default:""
    },
    fs_note:{
        type: String,
        default:""
    },
    fs_time_created:{
        type:Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    },
},{
    collection: 'TinhluongFormSalary',
    versionKey: false,
    timestamp: true
})


// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
TinhluongFormSalarySchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("TinhluongFormSalary", TinhluongFormSalarySchema).find({},
            {fs_id:1}).sort({fs_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].fs_id + 1;
            await Counter.findOneAndUpdate({TableId: 'TinhluongFormSalaryId'}, {$set:{Count:maxId}});
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

module.exports = connection.model("TinhluongFormSalary", TinhluongFormSalarySchema); 