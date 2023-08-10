var express = require('express');
var router = express.Router();
const formData = require('express-form-data');
const toolRaoNhanh = require('../../controllers/tools/raonhanh365');

router.post('/raonhanh/toolAdminUserRight', toolRaoNhanh.toolAdminUserRight);
router.post('/raonhanh/toolAdminMenuOrder', toolRaoNhanh.toolAdminMenuOrder);
router.post('/raonhanh/toolModule', toolRaoNhanh.toolModule);
router.post('/raonhanh/toolCateDetail', toolRaoNhanh.toolCateDetail);
router.post('/raonhanh/toolNewRN', toolRaoNhanh.toolNewRN);
router.post('/raonhanh/toolCategory', toolRaoNhanh.toolCategory);
router.post('/raonhanh/updateInfoSell', toolRaoNhanh.updateInfoSell);
router.post('/raonhanh/toolPriceList', toolRaoNhanh.toolPriceList);
router.post('/raonhanh/toolCity', toolRaoNhanh.toolCity);
router.post('/raonhanh/toolLike', toolRaoNhanh.toolLike);
router.post('/raonhanh/toolHistory', toolRaoNhanh.toolHistory);
router.post('/raonhanh/toolBidding',toolRaoNhanh.toolBidding)
router.post('/raonhanh/toolApplyNew', toolRaoNhanh.toolApplyNew);
router.post('/raonhanh/toolComment', toolRaoNhanh.toolComment);
router.post('/raonhanh/toolOrder', toolRaoNhanh.toolOrder);
router.post('/raonhanh/toolTagsIndex', toolRaoNhanh.toolTagsIndex);
router.post('/raonhanh/updateNewDescription',toolRaoNhanh.updateNewDescription);
router.post('/raonhanh/toolEvaluate', toolRaoNhanh.toolEvaluate);
router.post('/raonhanh/toolCart', toolRaoNhanh.toolCart);
router.post('/raonhanh/toolTags', toolRaoNhanh.toolTags);
router.post('/raonhanh/toolContact', toolRaoNhanh.toolContact);
router.post('/raonhanh/toolRegisterFail', toolRaoNhanh.toolRegisterFail);
router.post('/raonhanh/toolSearch', toolRaoNhanh.toolSearch);
router.post('/raonhanh/toolTblTags', toolRaoNhanh.toolTblTags);
router.post('/raonhanh/toolPushNewsTime', toolRaoNhanh.toolPushNewsTime);
router.post('/raonhanh/toolAdminUser', toolRaoNhanh.toolAdminUser);
router.post('/raonhanh/toolAdminTranslate', toolRaoNhanh.toolAdminTranslate);
router.post('/raonhanh/toolBlog',toolRaoNhanh.toolBlog)
router.post('/raonhanh/toolLoveNew',toolRaoNhanh.toolLoveNew)
module.exports = router;