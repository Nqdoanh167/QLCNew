var express = require('express');
var router = express.Router();
const formData = require('express-form-data');
const permistionNotify = require('../../controllers/timviec/permisionNotify');
const functions = require('../../services/functions');

router.post('/list', functions.checkToken, permistionNotify.list);
router.post('/getUserByIdChat', formData.parse(), permistionNotify.getUserByIdChat);

module.exports = router;