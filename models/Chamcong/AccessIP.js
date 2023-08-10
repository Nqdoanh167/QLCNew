const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccessIPSchema = new Schema({
_id: {
        type: Number,
        require: true
    },
id_com : {
    type: Number

},
ip_access : {
    type: String

},
from_site : {
    type: String

},
created_time : {
    type: Number

},
update_time : {
    type: Number

},



});
module.exports = mongoose.model("CC365_AccessIP", AccessIPSchema);



// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const CalendarSchema = new Schema({
// _id: {
//         type: Number,
//         require: true
//     },


    

// });
// module.exports = mongoose.model("CC365_Calendar", CalendarSchema);