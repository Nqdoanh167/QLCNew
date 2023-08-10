const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackCustomerSchema = new Schema({
    _id: {
        type: Number,
        require: true
    },
    id_user : {
        type : Number,

    },
    type_user : {
        type : Number,
        default : 1
    },
    feed_back : {
        type : String,

    },
    rating : {
        type : Number,

    },
    create_date : {
        type : Date,
        default : new Date()

    },
    app_name : {
        type : Number,
        default : 'Chamcong365'
    },
    from_source : {//'From 1 là từ app, 2 là từ web'
        type : Number,
        default : 1
    },

    

});
module.exports = mongoose.model("CC365_FeedbackCustomer", FeedbackCustomerSchema);