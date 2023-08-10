const router = require('express').Router();
const ApplicationController = require("../../controllers/qlcnew/application")
const formData = require('express-form-data')
const functions = require("../../services/functions");



//Thêm mới ứng dụng cho người dùng 
router.post("/createapps", formData.parse(), ApplicationController.createApps);
//Danh sách ứng dụng
router.get("/", formData.parse(), ApplicationController.getAllApps);

module.exports = router