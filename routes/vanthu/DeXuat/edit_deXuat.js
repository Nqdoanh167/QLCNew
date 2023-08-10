const express = require('express');
const router = express.Router();
const data = require('express-form-data');
const edit_Controller = require('../../../controllers/vanthu/DeXuat/edit_deXuat');
router.post('/edit_delType', data.parse(), edit_Controller.edit_del_type);


router.post('/edit_active', data.parse(), edit_Controller.edit_active);
//router.post('/edit_time_tiep_nhan', data.parse(), edit_Controller.edit_tiep_nhan);
module.exports = router;