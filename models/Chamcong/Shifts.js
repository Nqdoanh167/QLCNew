const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const ShiftSchema = new Schema({
    //Id của ca làm việc
    shift_id:{
        type: Number,
        require:true
    },
    //Id của công ty
    com_id: {
        type: Number,
        require:true
    },
    //Tên ca làm việc
    shift_name: {
        type: String,
        default:""
    },
    // Thời gian bắt đầu ca làm việc theo
    start_time:{
        type:String,
        default:""
    },
    // Thời gian chấm công sớm nhất 
    start_time_latest:{
        type:String,
        default:"" 
    },
    // Thời gian kết thúc ca làm việc 
    end_time:{
        type:String,
        default:""
    },
    // Mr Hiệp code => cẩn sửa, để sau 
    // Thời gian chấm công muộn nhất
    end_time_earliest:{
        type:String,
        default:""
    },
    //Thời điểm tạo ca làm việc
    create_time: {
        type: Date,
        default: new Date()
    },
    over_night: {
        type: Number,
        default:0
    },
    // 1 là số ca theo công 
    // 2 là số ca theo giờ 
    shift_type: {
        type: Number,
        default:1,
    },
    // số công ghi nhân cho ca này 
    num_to_calculate:{
        type: Number,
        default:1,
    },
    // tiền ứng với ca => không dùng 
    num_to_money:{
        type: Number,
        default:0,
    },
    is_overtime:{
        type: Number,
        default:0,
    },
    status:{
        type: Number,
        default:1,
    }
},{
    collection: 'shifts',
    versionKey: false,
    timestamp: true
})


// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
ShiftSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("Shift", ShiftSchema).find({},
            {shift_id:1}).sort({shift_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].shift_id + 1;
            await Counter.findOneAndUpdate({TableId: 'ShiftId'}, {$set:{Count:maxId}});
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

module.exports = connection.model("Shift", ShiftSchema); 