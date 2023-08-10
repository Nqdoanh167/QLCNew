var express = require('express');
var router = express.Router();


var adddeXuat = require("../routes/vanthu/DeXuat/create_dx")

var settingDXroutes = require('./vanthu/SettingRoutes')
var cateDXroutes = require('./vanthu/cateDeXuatRoutes');

var toolVT = require('./vanthu/RoutertoolVT')
var DeleteDX = require('./vanthu/DeXuat/delete_Dx')
var EditDX = require('./vanthu/DeXuat/edit_deXuat')
var TKNP = require('./vanthu/DeXuat/thong_ke_nghi_phep')


//Api thêm mới các loại đề xuất
router.use('/dexuat', adddeXuat);

//Api setting 
router.use('/setting', settingDXroutes)
    //Api  de xuat và hiển thị
router.use('/catedx', cateDXroutes)


//Api xóa để xuất và sửa 
router.use('/deletedx', DeleteDX)
router.use('/editdx', EditDX)

router.use('/thongkenp', TKNP)


//Api tool quét data văn thư
router.use('/tooldata', toolVT)


module.exports = router