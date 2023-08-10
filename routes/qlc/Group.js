const router = require('express').Router();
const GroupController = require('../../controllers/qlc/Group')
const formData = require('express-form-data')
const functions = require("../../services/functions")

//API lấy tất cả dữ liệu nhóm
// router.get("/", GroupController.getListGroup);

//API lấy dữ liệu một nhóm
// router.get("/:id", GroupController.getGroupById);

//Api tạo một nhóm mới
router.post("/", formData.parse(), GroupController.createGroup);

//API đếm số lượng nhân viên trong nhóm
// router.post("/count", formData.parse(), GroupController.countUserInGroup);

//API thay đổi thông tin của một nhóm
router.post("/edit", formData.parse(), GroupController.editGroup);

//API Xóa một nhóm theo id
router.delete("/", formData.parse(), GroupController.deleteGroup);

//API tim kiem theo cac dieu kien
router.post('/search', formData.parse(), GroupController.getListGroupByFields);

module.exports = router