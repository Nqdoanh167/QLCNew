const router = require('express').Router();
const DeparmentController = require('../../controllers/qlc/Deparment')
const functions = require("../../services/functions")
const formData = require('express-form-data')

//API lấy tất cả dữ liệu phòng ban 
router.post("/get", formData.parse(), DeparmentController.getListDeparment);
//API đếm số lượng nhân viên phòng ban 
router.post("/count", formData.parse(), DeparmentController.countUserInDepartment);



//API tạo mới một phòng ban
router.post("/", formData.parse(), DeparmentController.createDeparment);

//API thay dổi thông tin của một phòng ban
router.post("/:id", formData.parse(), DeparmentController.editDeparment);

//API xóa một phòng ban theo id
router.delete("/del", formData.parse(), DeparmentController.deleteDeparment);


module.exports = router