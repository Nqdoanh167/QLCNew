const router = require("express").Router()
const controller = require("../../controllers/qlc/TrackingWifi")
const formData = require("express-form-data")
const functions= require ("../../services/functions")



// đổ danh sách wifi chấm công 
router.post("/",formData.parse(), controller.getlist)
//tạo để test
router.post("/create",formData.parse(), controller.CreateQR)


module.exports = router