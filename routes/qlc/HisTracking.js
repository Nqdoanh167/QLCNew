const router = require('express').Router();
const HisTrackingController = require('../../controllers/qlc/HisTracking');
// const functions= require ("../../services/functions")
const formData = require("express-form-data")
const functions= require ("../../services/functions")

// lịch sử chấm công được ghi lại 
router.post('/',formData.parse(),HisTrackingController.CreateTracking)


router.post('/com/success',formData.parse(),HisTrackingController.getListUserTrackingSuccess)


router.post('/com/false',formData.parse(),HisTrackingController.getlistUserNoneHistoryOfTracking)


router.post('/com/time',formData.parse(),HisTrackingController.getTrackingtime)


router.post('/com/all/condition',formData.parse(),HisTrackingController.getTrackingALLCondition)


router.post('/com/all/condition/NotTime',formData.parse(),HisTrackingController.getTrackingALLConNotTime)














module.exports = router