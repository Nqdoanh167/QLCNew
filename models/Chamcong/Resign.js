const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');
const ResignSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    ep_id : {
        type : Number,

    },
    com_id : {
        type : Number,
        default : 0

    },
    decision_id : {
        type : Number,

    },
    note : {
        type : String,
    },
    type : {//1.giảm biên chế, 2. nghỉ việc
        type : Number,

    },
    shift_id : {
        type : String,

    },
    created_at : {
        type : Number,
    },
});

// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
ResignSchema.pre('save', async function(next) {
    try{
        await Counter.findOneAndUpdate({TableId: 'CC365_ResignId'}, {$inc: { Count: 1} });
        next();
    }
    catch(e){
        return next(e);
    }
});
module.exports = connection.model("CC365_Resign", ResignSchema);