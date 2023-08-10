const router = require("express").Router()
const controller = require("../../controllers/qlc/CheckVip")
const formData = require("express-form-data")
const functions = require("../../services/functions")

//check vip

router.post("/", formData.parse(), functions.checkToken, controller.check1)
router.post("/before", formData.parse(), controller.check2)

module.exports = router