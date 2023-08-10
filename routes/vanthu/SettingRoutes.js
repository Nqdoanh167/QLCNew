const router = require('express').Router();
const settingVanthu = require("../../controllers/vanthu/Setting/Setting")
var formData = require('express-form-data');

//Api lấy dữ liệu toàn bộ settiing
router.post('/',formData.parse(),settingVanthu.getSettings);


// Api lấy dữ liệu seting theo com_id nếu không có sẽ tạo mới
 

router.post('/createF',formData.parse(),settingVanthu.findOrCreateSettingDx)

// Api sửa setting
router.post('/editSetting',formData.parse(),settingVanthu.editSettingDx);


module.exports = router