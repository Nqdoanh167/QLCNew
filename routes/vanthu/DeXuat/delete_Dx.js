const express = require('express');
const router = express.Router();
var formData = require('express-form-data');
const controller = require('../../../controllers/vanthu/DeXuat/delete_dx');
router.post('/delete_dx', formData.parse(), controller.delete_dx);
router.post('/ds_de_xuat_da_xoa', formData.parse(), controller.de_xuat_da_xoa_All);
router.post('/khoi_phuc', formData.parse(), controller.khoi_phuc);
router.post('/xoa_vinh_vien', formData.parse(), controller.xoa_vinh_vien);
module.exports = router;