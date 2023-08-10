var express = require('express');
var router = express.Router();
var homeController = require('../../controllers/hr/homeController');
var formData = require('express-form-data');
const functions = require('../../services/functions');
const hrService = require('../../services/hr/hrService');


//------------------------------api home
router.post('/getListInfo', formData.parse(), hrService.checkRoleUser, homeController.getListInfo);

module.exports = router;