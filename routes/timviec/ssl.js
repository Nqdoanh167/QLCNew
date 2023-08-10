const express = require('express');
const router = express.Router();
const formData = require('express-form-data');
const ssl = require('../../controllers/timviec/ssl');

//so sánh lương
router.post('', formData.parse(), ssl.findSalary)

// Tìm kiếm 
router.search('/search', formData.parse(), ssl.search);

// Tìm kiếm 
router.search('/cate', formData.parse(), ssl.cate);
module.exports = router;