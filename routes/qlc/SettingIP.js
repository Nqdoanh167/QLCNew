const router = require('express').Router();
const controller = require('../../controllers/qlc/SettingIP')
const formData = require('express-form-data')
const functions = require("../../services/functions")

// router.get("/" ,controller.getListIP);

router.post("/get", formData.parse(), controller.getListByID)

router.post("/create", formData.parse(), controller.createIP)

router.post("/edit", formData.parse(), controller.editsettingIP)

//API xóa cài đạt ip của một công ty
router.delete("/delete", formData.parse(), controller.deleteSetIpByID)

//API xóa toàn bộ cài đạt ip đã có trong hệ thống
// router.delete("/",formData.parse(), controller.deleteAllsetIp)

module.exports = router