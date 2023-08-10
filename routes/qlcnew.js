/** @format */

var express = require('express');
var router = express.Router();

var LevelCompanyRouter = require('./qlcnew/level_company');
var InvitationRouter = require('./qlcnew/invitation');
var UserRouter = require('./qlcnew/user');
var ApplicationRouter = require('./qlcnew/application');
var ChangedepartmentalRouter = require('./qlcnew/changedepartmental');
var ProjectRouter = require('./qlcnew/project');
var TimeSheetsRouter = require('./qlcnew/timesheets');

router.use('/LevelCompany', LevelCompanyRouter);
router.use('/Invitation', InvitationRouter);
router.use('/User', UserRouter);
router.use('/Application', ApplicationRouter);
router.use('/Changedepartmental', ChangedepartmentalRouter);
router.use('/Project', ProjectRouter);
router.use('/TimeSheets', TimeSheetsRouter);

module.exports = router;
