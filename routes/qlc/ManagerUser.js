const router = require('express').Router();
const managerUserController = require('../../controllers/qlc/ManageUser');
const formData = require('express-form-data')
const functions = require("../../services/functions")



//API lấy danh sách nhân viên
router.post("/user", formData.parse(), managerUserController.getlistAdmin);

//API tạo mới một User
router.post("/", formData.parse(), managerUserController.createUser);

//API thay dổi thông tin của một user
router.post("/:id", formData.parse(), managerUserController.editUser);

//API xóa một user theo id
router.delete("/:id", formData.parse(), managerUserController.deleteUser);

// API xóa toàn bộ nv hiện có
router.delete("/", managerUserController.deleteAllUser);

module.exports = router