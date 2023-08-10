const router = require('express').Router();
const CheckDeviceController = require("../../controllers/qlc/CheckDevice");
const functions= require ("../../services/functions")
const formData = require('express-form-data')
//lấy danh sách thiết bị 
router.get("/",functions.checkToken, CheckDeviceController.getAllDevice);

//loc danh sach theo cty 
router.get("/company/all",functions.checkToken, CheckDeviceController.getALlCompanyDevice);

//loc danh sach theo cty va phong ban  
router.get("/company/depart/all",functions.checkToken, CheckDeviceController.getALlCompanyDepartmentDevice);

//lấy dang ki  thiết bị theo Id 
router.get("/:id",functions.checkToken, CheckDeviceController.getDeviceById);

//tao moi yeu cau dang ki thiet bi
router.post("/",functions.checkToken,formData.parse(), CheckDeviceController.createDevice)

//chinh sua yeu cau dang ki thiet bi
router.post("/:id",functions.checkToken,formData.parse(), CheckDeviceController.editDevice)

//xoa yeu cau cau dang ki thiet bi
router.delete("/:id",functions.checkToken, CheckDeviceController.deleteDevice)

//xoa yeu cau cau dang ki thiet bi
router.delete("/",functions.checkToken, CheckDeviceController.deleteAllDevice)

module.exports = router