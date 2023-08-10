/** @format */

const router = require('express').Router();
const ProjectController = require('../../controllers/qlcnew/project');
const formData = require('express-form-data');
const functions = require('../../services/functions');
const checkpermission = require('../../services/qlcnew/checkpermission');
// thêm mới dự án
router.post('/', formData.parse(), functions.checkToken, ProjectController.create);
//chỉnh sửa dự án
router.patch('/edit', formData.parse(), functions.checkToken, checkpermission.checkPermission, ProjectController.edit);
// xóa dự án
router.delete('/:id', formData.parse(), functions.checkToken, checkpermission.checkPermission, ProjectController.delete);
// thêm mới công việc cho thành viên
router.post('/addwork', formData.parse(), functions.checkToken, checkpermission.checkPermission, ProjectController.addWorkForEmployee);
//chỉnh sửa công việc của thành viên
router.patch('/editwork', formData.parse(), functions.checkToken, checkpermission.checkPermission, ProjectController.editWorkForEmployee);
//xóa công việc của thành viên
router.delete('/deletework/:id', formData.parse(), functions.checkToken, checkpermission.checkPermission, ProjectController.deleteWorkForEmployee);
//lấy thông tin dự án
router.get('/:id', formData.parse(), functions.checkToken, ProjectController.getProject);
//lấy tất cả thông các dự án
router.get('/', formData.parse(), functions.checkToken, ProjectController.getAllProject);

module.exports = router;
