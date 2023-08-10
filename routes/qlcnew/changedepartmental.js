var express = require('express');
var router = express.Router();
var changeDepartmentalController = require('../../controllers/qlcnew/changedepartmental');
var formData = require('express-form-data');
const qlcnewservice = require('../../services/qlcnew/qlcnewservice')

//----------luan chuyen cong tac
router.post('/getListChangeDepartmental', formData.parse(), qlcnewservice.checkRoleUser, qlcnewservice.checkRight(2, 1),  changeDepartmentalController.getListChangeDepartmental);
router.post('/updateChangeDepartmental', formData.parse(), qlcnewservice.checkRoleUser, qlcnewservice.checkRight(2, 3),  changeDepartmentalController.getAndCheckData, changeDepartmentalController.updateChangeDepartmental);
router.post('/deleteChangeDepartmental', formData.parse(), qlcnewservice.checkRoleUser, qlcnewservice.checkRight(2, 4),  changeDepartmentalController.deleteChangeDepartmental);

module.exports = router

