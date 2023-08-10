const router = require('express').Router();
const TeamController = require('../../controllers/qlc/Team')
const formData = require('express-form-data')
const functions = require("../../services/functions")

//Lấy toàn bộ dữ liệu tổ
router.post("/search", formData.parse(), TeamController.getListTeam);

//Lấy dữ liệu của một tổ
// router.get("/:id", TeamController.getTeamById);

//Tạo mới dữ liệu của một tổ
router.post("/", formData.parse(), TeamController.createTeam);
//API đếm số lượng nhân viên trong tổ
router.post("/team", formData.parse(), TeamController.countUserInTeam);
//Chỉnh sửa dự liệu của một tổ
router.post("/:id", formData.parse(), TeamController.editTeam);

//Xóa dữ liệu của một tổ
router.delete("/del", formData.parse(), TeamController.deleteTeam);

//Xoá toàn bộ dữ liệu tổ
router.delete("/", TeamController.deleteAllTeams)

module.exports = router