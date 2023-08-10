const router = require('express').Router();
const formData = require("express-form-data");
const controller = require('../../../controllers/vanthu/DeXuat/thong_ke_nghi_phep');
router.post('/danh_sach_nghi_phep', formData.parse(), controller.thong_ke_nghi_phep);

module.exports = router;