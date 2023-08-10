const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../Counter');
let connection = mongoose.createConnection('mongodb://localhost:27017/api-base365');


const CC365_CompanyWorkdaySchema = new Schema({

    cw_id:{
        type: Number,
        require:true
    },

    com_id: {
        type: Number,
        require:true
    },

    apply_month: {
        type: String,
        default:""
    },

    num_days:{
        type: Number,
        require:true
    },
},{
    collection: 'CC365_CompanyWorkday',
    versionKey: false,
    timestamp: true
})


// lúc insert lấy dữ liệu ở bảng Counter ra => tăng lên 1 rồi save 
CC365_CompanyWorkdaySchema.pre('save', async function(next) {
    try{
        let maxId = await connection.model("CC365_CompanyWorkday", CC365_CompanyWorkdaySchema).find({},
            {cw_id:1}).sort({cw_id:-1}).limit(1);
        if(maxId && maxId.length){
            console.log(maxId)
            maxId = maxId[0].cw_id + 1;
            await Counter.findOneAndUpdate({TableId: 'CC365_CompanyWorkdayId'}, {$set:{Count:maxId}});
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

module.exports = connection.model("CC365_CompanyWorkday", CC365_CompanyWorkdaySchema); 