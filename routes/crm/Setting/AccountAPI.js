const router = require("express").Router()
const controller = require("../../../controllers/crm/Setting/AccountAPI")
const formData = require("express-form-data")
const functions = require('../../../services/functions')



//thêmm cài đặt hợp đồng
router.post("/add",functions.checkToken,formData.parse(), controller.addContract)

//kết nối tổng đài 
router.post('/connectTd',functions.checkToken,formData.parse(),controller.connectTd)


module.exports = router