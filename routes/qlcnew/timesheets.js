/** @format */

const router = require('express').Router();
const TimeSheetsController = require('../../controllers/qlcnew/timesheets');
const formData = require('express-form-data');
const functions = require('../../services/functions');
// // tạo bảng chấm công của nhân viên
router.post('/', formData.parse(), functions.checkToken, TimeSheetsController.create);
// xóa bảng chấm công của nhân viên
router.delete('/:id', formData.parse(), functions.checkToken, TimeSheetsController.delete);
//lấy thông tin bảng chấm công của nhân viên
router.get('/:id', formData.parse(), functions.checkToken, TimeSheetsController.getTimeSheets);
// //lấy tất cả thông các dự án
router.get('/', formData.parse(), functions.checkToken, TimeSheetsController.getAllTimeSheets);

module.exports = router;
