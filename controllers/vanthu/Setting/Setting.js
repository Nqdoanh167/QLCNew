const SettingDX = require('../../../models/Vanthu/setting_dx');
const functions = require("../../../services/functions");
// const Group = require("../../../models/qlc/Group");

// Hàm lấy dữ liệu Setting
exports.getSettings = async(req, res) => {
    try {

        const settings = await SettingDX.find();
        res.status(200).json(settings)
    } catch (error) {
        console.error('Failed to get settings', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
};

// hàm tạo mới và hiển thị cài đặt tài khoản côngty

exports.findOrCreateSettingDx = async(req, res) => {
    try {
        let { type_setting, type_browse, time_limit, shift_id, time_limit_l, list_user, time_tp, time_hh } = req.body;
        let com_id = req.user.data.inForPerson.employee.com_id
        let createDate = new Date();
        if (!com_id) {
            throw new Error("Com Id required");
        } else if (!functions.checkNumber(com_id)) {
            throw new Error("Com Id must be a number");
        } else {
            let settingDx = await SettingDX.findOne({ com_id });

            if (!settingDx) {
                let maxID = await functions.getMaxID(SettingDX);
                if (!maxID) {
                    maxID = 0;
                }
                const _id = Number(maxID) + 1;

                settingDx = new SettingDX({
                    _id: _id,
                    com_id: com_id,
                    type_setting: type_setting,
                    type_browse: type_browse,
                    time_limit: time_limit,
                    shift_id: shift_id,
                    time_limit_l: time_limit_l,
                    list_user: list_user,
                    time_tp: time_tp,
                    time_hh: time_hh,
                    time_created: createDate
                });

                await settingDx.save();
            }

            res.status(200).json(settingDx);
        }
    } catch (err) {
        functions.setError(res, err.message, 709);
    }
};




//hàm sửa setting
// exports.editSettingDx = async (req,res) => {

//         let updateDate = new Date()
//         if(isNaN(_id)){
//             functions.setError(res, "Id must be a number", 702);
//         }else {
//             let {com_id,type_setting,type_browse,time_limit,shift_id,time_limit_l,list_user,time_tp,time_hh,time_created} = req.body;
//             if(!com_id){
//                 //Kiểm tra Id công ty khác null
//                 functions.setError(res, "Com Id required", 704);
//             }else if(typeof com_id != "number") {
//                 functions.setError(res, "Com Id must be a number", 705);
//             }else if(!type_setting){
//                 //Kiểm tra loại setting khác null
//                 functions.setError(res, "type setting required", 704);
//             }else  if(!type_browse){
//                 //kiểm tra loại duyệt khác null
//                 functions.setError(res, "type_browse required", 704);
//             }else  if(!time_limit){
//                 functions.setError(res, "time_limit required", 704);
//             }else if(!shift_id) {
//                 functions.setError(res, "shift_id required", 704);
//             }else if(!time_limit_l) {
//                 functions.setError(res, "time_limit_l required", 704);
//             }else if(list_user) {
//                 functions.setError(res, "list_user required", 704);
//             }else if(time_tp){
//                 functions.setError(res, "time_tp required", 704);
//             }else if(time_hh) {
//                 functions.setError(res, "time_hh required", 704);
//             }else if(time_created){
//                 functions.setError(res, "time_created required", 704);
//             }else {
//                 const editSetting = await functions.getDatafindOne(SettingDX,{_id : _id});
//                 if(!editSetting){
//                     functions.setError(res, "editSetting does not exist", 710);
//                 }else {
//                     await functions.getDatafindOneAndUpdate(SettingDX,{_id : _id},{
//                         com_id : com_id,
//                         type_setting : type_setting,
//                         type_browse : type_browse,
//                         time_limit : time_limit,
//                         shift_id : shift_id,
//                         time_limit_l : time_limit_l,
//                         list_user : list_user,
//                         time_tp : time_tp,
//                         time_hh : time_hh,
//                         time_created : time_created,
//                         update_time : updateDate
//                     })
//                         .then((group) => functions.success(res, "Group edited successfully".group))
//                         .catch(err => functions.setError(res, err.message), 711);
//                 }
//             }
//         }
// }

exports.editSettingDx = async(req, res) => {
    try {
        let updateDate = new Date();
        let { _id, type_setting, type_browse, time_limit, shift_id, time_limit_l, list_user, time_tp, time_hh, time_created } = req.body;
        let com_id = req.user.data.inForPerson.employee.com_id
        if (Number.isNaN(_id)) {
            throw { code: 704, message: " Id required" };
        } else if (!com_id) {
            throw { code: 704, message: "Com Id required" };
        } else if (!type_setting) {
            throw { code: 704, message: "type setting required" };
        } else if (!type_browse) {
            throw { code: 704, message: "type_browse required" };
        } else if (!time_limit) {
            throw { code: 704, message: "time_limit required" };
        } else if (!shift_id) {
            throw { code: 704, message: "shift_id required" };
        } else if (!time_limit_l) {
            throw { code: 704, message: "time_limit_l required" };
        } else if (!list_user) {
            throw { code: 704, message: "list_user required" };
        } else if (!time_tp) {
            throw { code: 704, message: "time_tp required" };
        } else if (!time_hh) {
            throw { code: 704, message: "time_hh required" };
        } else if (!time_created) {
            throw { code: 704, message: "time_created required" };
        } else {
            const editSetting = await functions.getDatafindOne(SettingDX, { _id: _id });
            if (!editSetting) {
                throw { code: 710, message: "editSetting does not exist" };
            } else {
                await functions.getDatafindOneAndUpdate(SettingDX, { com_id: com_id }, {
                    com_id: com_id,
                    type_setting: type_setting,
                    type_browse: type_browse,
                    time_limit: time_limit,
                    shift_id: shift_id,
                    time_limit_l: time_limit_l,
                    list_user: list_user,
                    time_tp: time_tp,
                    time_hh: time_hh,
                    time_created: time_created,
                    update_time: updateDate
                });
                functions.success(res, "Group edited successfully");
            }
        }
    } catch (error) {
        functions.setError(res, error.message, error.code);
    }
};