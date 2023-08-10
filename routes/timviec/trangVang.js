const express = require('express');
const router = express.Router();
const formData = require('express-form-data');
const trangVang = require('../../controllers/timviec/trangVang');

// Trang chủ
router.post('/', trangVang.home);

// danh mục lĩnh vực ngành nghề
router.post('/getLV', trangVang.getLV);

// tìm kiếm công ty theo điều kiện
router.post('/findCompany', trangVang.findCompany);

router.post('/yp_list_company', formData.parse(), trangVang.yp_list_company);
router.post('/yp_list_cate', formData.parse(), trangVang.yp_list_cate);

module.exports = router;