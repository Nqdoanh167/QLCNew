const express = require('express');
const router = express.Router();
const formData = require('express-form-data');
const functions = require('../../services/functions');
const mail365 = require('../../controllers/timviec/mail365');


// ds danh mục email trang chủ
router.post('', formData.parse(), mail365.getCategories);

// ds email theo danh mục

router.post('/findByCategory', formData.parse(), mail365.findByCategory);

// xem trước email

router.post('/preview', formData.parse(), mail365.preview);

// chi tiết email

router.post('/viewDetail', functions.checkToken, formData.parse(), mail365.viewDetail);

module.exports = router;