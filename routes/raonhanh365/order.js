const express = require('express');
var router = express.Router();
const formData = require('express-form-data');
const functions = require('../../services/functions')
const orderRN = require('../../controllers/raonhanh365/order');

// đặt hàng
router.post('/order',formData.parse(),functions.checkToken,orderRN.order)

// đấu thầu
router.post('/bidding',formData.parse(),functions.checkToken,orderRN.bidding)

// quản lý đơn mua
router.get('/manageOrderBuy/:linkTitle',functions.checkToken,orderRN.manageOrderBuy)

// quản lý đơn bán
router.get('/manageOrderSell/:linkTitle',functions.checkToken,orderRN.manageOrderSell)

// trạng thái đơn hàng
router.post('/statusOrder',formData.parse(),functions.checkToken,orderRN.statusOrder)

// Huỷ đơn hàng
router.post('/cancelOrder',formData.parse(),functions.checkToken,orderRN.cancelOrder)
module.exports = router;