const router = require('express').Router();
const UserController = require("../../controllers/qlcnew/user")
const formData = require('express-form-data')



//Lấy ra danh sách tất cả người dùng
router.get("/all", formData.parse(), UserController.getAll);
//Lấy ra danh sách tất cả người dùng của công ty
router.get("/company/:com_id", formData.parse(), UserController.getAllUserOfCompany);
//Lấy ra tên người dùng theo ID
router.get("/:id", formData.parse(), UserController.getUserById);
//Tạo người dùng chưa xét duyệt
router.post("/", formData.parse(), UserController.create);
//Tạo người dùng đã duyệt sẵn
router.post("/verified", formData.parse(), UserController.createVerified);
//Người dùng xin vào công ty mới
router.post("/apply/:id", formData.parse(), UserController.applyNewCompany);
//Công ty acept ứng viên vào công ty mình
router.post("/acept/:id", formData.parse(), UserController.aceptUserRequest);
//Edit người dùng của quản trị viên
router.put("/:id", formData.parse(), UserController.editUser);
//Thay đổi phòng ban
router.put("/workunit/:id", formData.parse(), UserController.changeWorkUnit);
//Thay đổi quyền quản trị
router.patch("/superadmin", formData.parse(), UserController.setSuperadmin);
//Xét duyệt
router.patch("/verify", formData.parse(), UserController.verifyUser);
//Xóa
router.delete("/:id", formData.parse(), UserController.deleteUser);
// Cấp quyền cho người dùng
router.post("/appPermission/:id", formData.parse(), UserController.updateAppPermission)
//Xóa người dùng khỏi ứng dụng
// router.post("appDelete/:id/:appId", formData.parse(), UserController.deleteUserFromApp)
module.exports = router