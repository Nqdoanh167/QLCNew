const router = require('express').Router();
const functions = require("../../services/functions")

const CalendarController = require("../../controllers/qlc/calendar")
var formData = require('express-form-data')

//Lấy danh sách toàn bộ lịch làm việc
router.get("/", formData.parse(), CalendarController.getAllCalendar);

//:ấy danh sách lịch làm việc của một công ty
router.get("/company/all", formData.parse(), CalendarController.getAllCalendarCompany)

//Lấy thông tin của 1 lịch làm việc
router.get("/:id", formData.parse(), CalendarController.getCalendarById)

//Tạo một lịch làm việc mới
router.post("/", formData.parse(), CalendarController.createCalendar)

//Chỉnh sửa một lịch làm việc đã có sẵn
router.post("/:id", formData.parse(), CalendarController.editCalendar)

//Copy một lịch làm việc đã có sẵn
router.post("/copy/:id", formData.parse(), CalendarController.copyCalendar)

//Xóa một lịch làm việc đã có sẵn
router.delete("/:id", formData.parse(), CalendarController.deleteCalendar)

//Xóa toàn bộ lịch làm việc của một công ty
router.delete("/company/all", formData.parse(), CalendarController.deleteCompanyCalendar)

//Xóa toàn bộ lịch làm việc của hệ thống
router.delete("/", formData.parse(), CalendarController.deleteAllCalendars)

module.exports = router