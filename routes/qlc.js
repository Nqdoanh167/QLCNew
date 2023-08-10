var express = require('express');
var router = express.Router();


var Admin = require('./qlc/admin/QLC_Admin')
var companyRouterQLC = require('./qlc/Company')
var EmployeeRouterQLC = require('./qlc/Employee')
var individualRouterQLC = require('./qlc/Individual')
var deparmentRouter = require('./qlc/Deparment')
var teamRouter = require('./qlc/Team');
var groupRouter = require('./qlc/Group');
var shiftRouter = require('./qlc/shift');
var calendarRouter = require('./qlc/calendar');
var childCompanyRouter = require('./qlc/ChildCompany')
var managerUser = require('./qlc/ManagerUser')
var DelAppData = require('./qlc/DelAppData')
var TrackingQR = require('./qlc/TrackingQR')
var TrackingWifi = require('./qlc/TrackingWifi')
var CheckVip = require('./qlc/CheckVip')
var Feedback = require('./qlc/Feedback')
var ReportError = require('./qlc/ReportError')
var employeeRoutes = require('./qlc/Employee');
var individualRoutes = require('./qlc/Individual');
var HisOfTrackingRouter = require("./qlc/HisTracking")
var CalendarWorkEmployee = require("./qlc/CalendarWorkEmployee")
var SetIpRouter = require("./qlc/SettingIP")
var homePage = require("./qlc/HomePageChamCong")



router.use('/Admin', Admin);
router.use('/Company', companyRouterQLC);
router.use('/employee', EmployeeRouterQLC);
router.use('/individual', individualRouterQLC);
router.use('/department', deparmentRouter);
router.use('/team', teamRouter);
router.use('/group', groupRouter);
router.use('/shift', shiftRouter);
router.use('/calendar', calendarRouter);
router.use('/childCompany', childCompanyRouter);
router.use('/managerUser', managerUser);
router.use('/delAppData', DelAppData);
router.use('/trackingQR', TrackingQR);
router.use('/trackingWifi', TrackingWifi);
router.use('/checkVip', CheckVip);
router.use('/feedback', Feedback);
router.use('/reportError', ReportError);
router.use('/employeeRoutes', employeeRoutes);
router.use('/individualRoutes', individualRoutes);
router.use('/hisOfTracking', HisOfTrackingRouter);
router.use('/calendarWorkEmployee', CalendarWorkEmployee);
router.use('/setIp', SetIpRouter);
router.use('/homePage', homePage);

module.exports = router;