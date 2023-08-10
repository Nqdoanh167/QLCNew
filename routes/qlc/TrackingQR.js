const router = require("express").Router()
const controller = require("../../controllers/qlc/TrackingQR")
const formData = require("express-form-data")
const functions= require ("../../services/functions")




///lấy danh sách vị trí công ty chấm công bằng QR
router.post("/",formData.parse(), controller.getlist)

router.post("/create",formData.parse(), controller.CreateQR)


// router.delete("/:id",formData.parse(), controller.deleteOne)
module.exports = router