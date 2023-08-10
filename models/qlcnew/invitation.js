const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const InvitationSchema = new Schema({
    _id: {
        type: Number,
        // require: true
    },
    companyID: {//ID cty
        type: Number
    },
    em_id_receive: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    timeExpried: {
        type: Number,
        default: 3 * 24 * 60 * 60 * 1000, // Mặc định là ba ngày

    },
    // Trường status kiểu String, giá trị mặc định là 'pending'
    status:
    {
        type: String,
        enum: ['pending', 'accepted', 'denied', 'expired'],
        default: 'pending'
    },
    Type: {
        type: Number,
        default: 1
    },

});
module.exports = mongoose.model("Invitation", InvitationSchema);
