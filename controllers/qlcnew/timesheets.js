/** @format */

const TimeSheets = require('../../models/qlcnew/timesheets');
const fn = require('../../services/functions');
const Deparment = require('../../models/qlc/Deparment');
exports.create = async (req, res) => {
   try {
      let {use_id, dep_id, shifts_name, time_checkIn, time_checkOut, desc, shift_type} = req.body;
      if (!use_id || !dep_id || !shifts_name || !time_checkIn || !time_checkOut || !shift_type) return fn.setError(res, 'Missing input value!', 400);
      //kiểm tra xem có phòng ban này k
      // if (isNaN(dep_id)) {
      //    fn.setError(res, 'Id must be a number', 400);
      // } else {
      //    let depart = await Deparment.findById(dep_id);
      //    if (!depart) fn.setError(res, 'Deparment not found', 400);
      // }
      let timeIn = time_checkIn != 0 ? new Date(time_checkIn * 1000) : null;
      let timeOut = time_checkOut != 0 ? new Date(time_checkOut * 1000) : null;

      // Lấy max id
      let maxId = await fn.getMaxID(TimeSheets);

      const timesheets = new TimeSheets({
         _id: Number(maxId) + 1 || 1,
         use_id: use_id,
         dep_id: dep_id,
         desc: desc,
         shifts_name: shifts_name,
         time_checkIn: timeIn,
         time_checkOut: timeOut,
         shift_type: shift_type,
      });
      await timesheets
         .save()
         .then(() => {
            fn.success(res, 'Create TimeSheets successfully', {data: timesheets._doc});
         })
         .catch((err) => {
            fn.setError(res, err.message, 400);
         });
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.delete = async (req, res) => {
   try {
      let _id = req.params.id;
      let doc = await TimeSheets.findByIdAndUpdate(
         _id,
         {
            is_deleted: true,
         },
         {new: true},
      );
      if (!doc) fn.setError(res, 'TimeSheets not found', 400);
      return fn.success(res, 'Successfully deleted TimeSheets');
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.getTimeSheets = async (req, res) => {
   try {
      const _id = req.params.id;
      const timesheets = await TimeSheets.findById(_id, {is_deleted: false});

      if (!timesheets) {
         return fn.setError(res, 'TimeSheets not found', 400);
      }

      return fn.success(res, 'Successfully retrieved timesheets', {data: timesheets});
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.getAllTimeSheets = async (req, res) => {
   try {
      const timesheets = await TimeSheets.find({is_deleted: false});
      if (timesheets.length === 0) return fn.setError(res, 'Không có dữ liệu', 400);
      return fn.success(res, 'Successfully retrieved all timesheets', {data: timesheets});
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
