const express = require('express');
const formData = require('express-form-data');

const newTV365 = require('../../controllers/timviec/newTV365')
const router = express.Router();
const functions = require('../../services/functions')

// api đăng tin tuyển dụng
router.post('/postNewTv365', functions.checkToken, formData.parse(), newTV365.postNewTv365);

// api sửa tin tuyển dụng
router.post('/updateNewTv365', functions.checkToken, formData.parse(), newTV365.updateNewTv365);

// api xóa tin
router.delete('/deleteNewTv365/:idNew', functions.checkToken, newTV365.deleteNewTv365);

//api lấy 1 bài viết để company cập nhập
router.get('/getDataPost', functions.checkToken, newTV365.getPost)

// api check đăng tin 10p/1 lần
router.get('/checkNew10p', functions.checkToken, newTV365.checkPostNew10p)

// api lấy tổng số tin theo thời gian
router.post('/getCountByTime', formData.parse(), functions.checkToken, newTV365.getCountByTime);

// api check mở mức đăng tin
router.post('/getNewCreateTime', formData.parse(), functions.checkToken, newTV365.getNewCreateTime);

// api lấy danh sách tin đăng của ntd
router.post('/getListTitleNew', formData.parse(), functions.checkToken, newTV365.getListTitleNew);

// api làm mới tin
router.get('/refreshNew', functions.checkToken, newTV365.refreshNew)

//api lấy 1 bài viết trước đăng nhập hoặc sau đăng nhập
router.post('/detail', functions.checkTokenV2, formData.parse(), newTV365.detail);

// api lấy danh sách bình luận của chi tiết tin
router.post('/listComment', formData.parse(), newTV365.listComment);

// Mới

//trang chủ
router.post('/homePage', formData.parse(), newTV365.homePage)

// tìm kiếm ngành nghề + tỉnh thành
router.post('/listJobBySearch', functions.checkTokenV2, formData.parse(), newTV365.listJobBySearch)

// Trả ra thông tin để render ra url
router.post('/renderUrlSearch', formData.parse(), newTV365.renderUrlSearch);

// Lấy danh sách tag
router.post('/getDataTag', formData.parse(), newTV365.getDataTag);
router.post('/addNewFromTv365', formData.parse(), newTV365.addNewFromTv365);

// Cập nhật điểm cho tin tuyển dụng
router.post('/updatePointNew', formData.parse(), newTV365.updatePointNew);

// Lấy tin mẫu
router.post('/sampleJobPostings', formData.parse(), newTV365.sampleJobPostings);

module.exports = router;