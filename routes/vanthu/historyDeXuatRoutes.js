const router = require('express').Router();
const historyDeXuat = require('../../controllers/vanthu/HistoryDX/HistoryDX')
var formData = require('express-form-data');

//show tất cả bảng lịch sử

router.get('/',historyDeXuat.showAllHis)

//show bảng đã gửi đi

router.post('/isend',formData.parse(),historyDeXuat.Isend)

module.exports = router;