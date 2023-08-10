const router = require("express").Router()
const controller = require("../../../controllers/qlc/admin/Admin")
const formData = require("express-form-data")
const functions= require ("../../../services/functions")

//check vip

router.post("/vip",formData.parse(), controller.setVip)


router.post("/listCom",formData.parse(), controller.getList)


router.post("/updatePassword",formData.parse(), controller.updatePassword)

router.post("/getListFeedback",formData.parse(), controller.getListFeedback)
module.exports = router