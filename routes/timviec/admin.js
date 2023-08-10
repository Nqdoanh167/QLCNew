var express = require('express');
var router = express.Router();
var admin = require('../../controllers/timviec/admin');
var formData = require('express-form-data');
const functions = require('../../services/functions');

// api lấy dữ liệu modules
router.post('/getDataModules', admin.getModules);

// api lấy dữ liệu admin qua adm_bophan
router.post('/getInfoAdminUser', formData.parse(), admin.getInfoAdminUser);

// api đăng ký admin
router.post('/postNewAdmin', formData.parse(), admin.postAdmin);

// api cập nhập admin
router.post('/updateAdmin', functions.checkToken, formData.parse(), admin.updateAdmin);

// api lấy thông tin chi tiết admin
router.post('/getAdminDetail', functions.checkToken, formData.parse(), admin.getAdminDetail);

// api lấy danh sách admin
router.post('/getListAdmin', functions.checkToken, formData.parse(), admin.getListAdmin);

// api xóa admin  
router.post('/deleteAdmin', functions.checkToken, formData.parse(), admin.deleteAdmin);

// api cập nhập active    
router.post('/updateActive', functions.checkToken, formData.parse(), admin.updateActive);

// api cập nhập password    
router.post('/updatePassword', functions.checkToken, formData.parse(), admin.updatePassword);

module.exports = router;