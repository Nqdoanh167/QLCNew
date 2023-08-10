const router = require('express').Router();
const CompanyController = require('../../controllers/qlc/ChildCompany')
const formData = require('express-form-data')
const functions = require("../../services/functions")

//API lấy tất cả dữ liệu cty 
router.post("/", formData.parse(), CompanyController.getListCompany);

//API tạo mới một cty
router.post("/create", formData.parse(), CompanyController.createCompany);

//API thay dổi thông tin của một cty
router.post("/edit", formData.parse(), CompanyController.editCompany);



module.exports = router