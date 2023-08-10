var express = require('express');
var router = express.Router();
var cart = require('../../controllers/raonhanh365/cart');
var formData = require('express-form-data');
const functions = require('../../services/functions');

//api lay ra danh sach tin trong gio hang theo userId
router.post('/getCart', formData.parse(), functions.checkToken, cart.getListCartByUserId);

//api them tin vao gio hang
router.post('/addCart', formData.parse(), functions.checkToken, cart.addCart);

//api xoa 1 cart by id hoac xoa tat ca
router.delete('/removeCart', formData.parse(),functions.checkToken, cart.removeCart);

module.exports = router;