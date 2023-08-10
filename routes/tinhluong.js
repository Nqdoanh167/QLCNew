const express = require('express');
const router = express.Router();


const test = require("../routes/tinhluong/test")
const nhanvien = require("../routes/tinhluong/nhanvien")
const congty = require("../routes/tinhluong/congty")
router.use('/test', test);
router.use('/nhanvien', nhanvien);
router.use('/congty', congty);

module.exports = router