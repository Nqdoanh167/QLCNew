/** @format */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SalaryBasicSchema = new Schema(
   {
      _id: {
         type: Number,
      },
      use_id: {
         type: Number,
      },
      dep_id: {
         type: Number,
      },
      com_id: {
         type: Number,
      },
      //tên ca
      shifts_name: {
         type: String,
      },
      //Giờ vào ca
      time_checkIn: {
         type: String,
      },
      //Giờ hết ca
      time_checkOut: {
         type: String,
      },
      // 1 là số ca theo công
      // 2 là số ca theo giờ
      shift_type: {
         type: Number,
         default: 1,
      },
      sb_reason: {
         type: String,
         default: '',
      },
      // 1 là lương theo ca
      // 2 là lương theo giờ
      sb_type: {
         type: Number,
         default: 1,
      },
      is_deleted: {
         type: Boolean,
         default: false,
      },
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model('SalaryBasic', SalaryBasicSchema);
