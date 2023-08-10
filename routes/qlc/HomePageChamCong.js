const router = require("express").Router()
const controller = require("../../controllers/qlc/HomePageChamCong")
const formData = require("express-form-data")
const functions= require ("../../services/functions")




//Xóa toàn bộ lịch sử chấm công
router.post("/",formData.parse(), controller.getlistUserNoneSetCarlendar)


module.exports = router