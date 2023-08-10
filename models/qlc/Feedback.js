const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Feedback = new Schema({
    _id: {//ID danh sách feedback
        type: Number,
    },
    idQLC: {
        type: Number
    },
    type: {// kieu user
        type: Number
    },
    email: {// email
        type: String
    },
    phoneTK: {// kieu user
        type: Number
    },
    feed_back: {//chi tiet
        type: String
    },
    rating: {// so sao
        type: Number,
    },
    createdAt: {//thời điểm tao
        type: String,
    },
    app_name: {//
        type: String,
    },

    from_source: { //nguon
        type: Number,
    },
})

module.exports = mongoose.model('Feedback', Feedback);