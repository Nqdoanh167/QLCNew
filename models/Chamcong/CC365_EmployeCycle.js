const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const CC365_EmployeCycleSchema = new Schema({
    epcy_id: {
        type: Number,
        require:true
    },
    ep_id: {
        type: Number,
        require:true
    },
    cy_id: {
        type: Number,
        require:true
    },
    update_time:{
        type: Date,
        default:new Date('1970-01-01T00:00:00.000+00:00')
    }
}, {
    collection: 'CC365_EmployeCycle',
    versionKey: false,
    timestamp: true
});
// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
CC365_EmployeCycleSchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("CC365_EmployeCycle", CC365_EmployeCycleSchema).find({},
            {epcy_id:1}).sort({epcy_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].epcy_id + 1;
            await Counter.findOneAndUpdate({TableId: 'CC365_EmployeCycleId'}, {$set:{Count:maxId}});
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
module.exports = connection.model("CC365_EmployeCycle", CC365_EmployeCycleSchema);