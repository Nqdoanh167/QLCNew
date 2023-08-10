const router = require('express').Router()
const employee = require('../../controllers/qlc/Employee')
const functions = require("../../services/functions")
var formData = require('express-form-data')
    //đăng kí tài khoản nhân viên 
router.post('/register', formData.parse(), employee.register)
    //Đăng nhập tài khoản NV
router.post('/login', formData.parse(), employee.login)
    // api xác nhận OTP để xác minh tìa khoản
router.post('/verify', formData.parse(), functions.checkToken, employee.verify);
//
router.post('/verifyCheckOTP', formData.parse(), functions.checkToken, employee.verifyCheckOTP);
// hàm đổi mật khẩu 
router.post('/updatePassword', functions.checkToken, formData.parse(), employee.updatePasswordbyToken);
//
router.post('/updatePasswordbyInput', formData.parse(), employee.updatePasswordbyInput);
// hàm cập nhập thông tin NV
router.post('/updateInfoEmployee', functions.checkToken, formData.parse(), employee.updateInfoEmployee);
// api api gửi mã OTP qua mail (quên mật khẩu) 
router.post('/forgotPassword', formData.parse(), employee.forgotPassword);

router.post('/info', formData.parse(), functions.checkToken, employee.info);





module.exports = router