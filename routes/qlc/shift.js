const router = require('express').Router();
const functions= require ("../../services/functions")

const ShiftController = require('../../controllers/qlc/Shift')
var formData = require('express-form-data')
//API lấy toàn bộ danh sách ca làm việc
router.get("/",formData.parse(), ShiftController.getListShifts)

//API lấy ca làm việc theo id
router.get("/:id",formData.parse(), ShiftController.getShiftById)

//API lấy danh sách ca làm việc theo Id công ty
router.get("/all/company",formData.parse(), ShiftController.getShiftByComId)

//API tạo một ca làm việc mới
router.post("/",formData.parse(), ShiftController.createShift)

//API chỉnh sửa thông tin của một ca làm việc
router.post("/:id",formData.parse(), ShiftController.editShift)

//API xóa một ca làm việc theo Id
router.delete("/:id",formData.parse(), ShiftController.deleteShift)

//API xóa toàn bộ ca làm việc của một công ty
router.delete("/all/company",formData.parse(), ShiftController.deleteShiftCompany)

//API xóa toàn bộ ca làm việc đã có trong hệ thống
router.delete("/",formData.parse(), ShiftController.deleteAllShifts)

module.exports = router