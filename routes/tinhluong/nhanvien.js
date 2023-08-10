const router = require('express').Router();
const nhanvien = require("../../controllers/tinhluong/nhanvien") 
const formData = require('express-form-data');

router.post('/qly_ttnv',formData.parse(), nhanvien.qly_ttnv);
router.post('/qly_ho_so_ca_nhan',formData.parse(), nhanvien.qly_ho_so_ca_nhan);
router.post('/show_payroll_user',formData.parse(), nhanvien.show_payroll_user);


module.exports = router