const functions = require('../../services/functions');
const hrFunctions = require('../../services/hr/hrService');
const HR_DepartmentDetails = require('../../models/hr/DepartmentDetails');
const axios = require('axios');
const https = require('https');
const Users = require('../../models/Users');
const Deparment = require("../../models/qlc/Deparment")
const Group = require('../../models/qlc/Group');
const Team = require('../../models/qlc/Team');
const HR_NestDetails = require('../../models/hr/NestDetail');
const Tracking = require('../../models/qlc/HisTracking');
const HR_DescPositions = require('../../models/hr/DescPositions');
const HR_SignatureImages = require('../../models/hr/SignatureImage');
const HR_InfoLeaders = require('../../models/hr/InfoLeaders')

const positionNames = {
    19: 'Chủ tịch hội đồng quản trị',
    18: 'Phó chủ tịch hội đồng quản trị',
    17: 'Thành viên hội đồng quản trị',
    21: 'Tổng giám đốc tập đoàn',
    22: 'Phó tổng giám đốc tập đoàn',
    16: 'Tổng giám đốc',
    14: 'Phó tổng giám đốc',
    8: 'Giám đốc',
    7: 'Phó giám đốc',
    6: 'Trưởng phòng',
    5: 'Phó trưởng phòng',
    13: 'Tổ trưởng',
    12: 'Phó tổ trưởng',
    4: 'Trưởng nhóm',
    20: 'Nhóm Phó',
    11: 'Trưởng ban dự án',
    10: 'Phó ban dự án',
    3: 'Nhân viên chính thức',
    2: 'Nhân viên thử việc',
    9: 'Nhân viên Part time',
    1: 'Sinh viên thực tập'
};

//cơ cấu tổ chức công ty, công ty con và phòng ban
exports.detailInfoCompany = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            // let com_id = req.infoLogin.comId
            // hiện đang ko dùng token để test, vì model user chưa có dữ liệu hoàn chỉnh
            let com_id = req.infoLogin.comId
            let shiftID = req.body.shiftID
            let CreateAt = req.body.CreateAt || true
            let inputNew = req.body.inputNew
            let inputOld = req.body.inputOld
            let result = {}
                //thông tin công ty cha
            result.infoCompany = {}
            let infoCompany = await Users.findOne({ idQLC: com_id, type: 1 }, { userName: 1 })

            if (infoCompany) {
                let infoGiamDoc = await Users.findOne({
                    type: 2,
                    "inForPerson.employee.com_id": com_id,
                    "inForPerson.employee.position_id": 8
                }, { userName: 1 })
                let infoPhoGiamDoc = await Users.findOne({
                    type: 2,
                    "inForPerson.employee.com_id": com_id,
                    "inForPerson.employee.position_id": 7
                }, { userName: 1 })
                let countEmp = await Users.countDocuments({
                    type: 2,
                    "inForPerson.employee.com_id": com_id
                })

                let countEmpDD = await Tracking.countDocuments({ companyId: com_id, shiftID: shiftID, CreateAt: { $gte: inputOld, $lte: inputNew } })
                result.infoCompany.parent_com_id = com_id
                result.infoCompany.companyName = infoCompany.userName

                if (infoGiamDoc) {
                    result.infoCompany.parent_manager = infoGiamDoc.userName
                } else result.infoCompany.parent_manager = "Chưa cập nhật"
                if (infoPhoGiamDoc) {
                    result.infoCompany.parent_deputy = infoPhoGiamDoc.userName
                } else result.infoCompany.parent_deputy = "Chưa cập nhật"
                result.infoCompany.tong_nv = countEmp
                result.infoCompany.tong_nv_da_diem_danh = countEmpDD

                //thông tin phòng ban cha
                let infoDepParent = await Deparment.find({ companyId: com_id })

                if (infoDepParent) {
                    result.infoCompany.infoDep = []

                    for (let i = 0; i < infoDepParent.length; i++) {
                        let infoDep = {}
                        infoDep.dep_id = infoDepParent[i]._id
                        infoDep.dep_name = infoDepParent[i].deparmentName
                        let infoTruongphong = await Users.findOne({
                            type: 2,
                            "inForPerson.employee.com_id": com_id,
                            "inForPerson.employee.dep_id": infoDepParent[i]._id,
                            "inForPerson.employee.position_id": 6
                        }, { userName: 1 })

                        if (infoTruongphong) {
                            infoDep.manager = infoTruongphong.userName
                        } else infoDep.manager = "chưa cập nhât"

                        let infoPhophong = await Users.findOne({
                            type: 2,
                            "inForPerson.employee.com_id": com_id,
                            "inForPerson.employee.dep_id": infoDepParent[i]._id,
                            "inForPerson.employee.position_id": 5
                        }, { userName: 1 })

                        if (infoPhophong) {
                            infoDep.deputy = infoPhophong.userName
                        } else infoDep.deputy = "chưa cập nhât"

                        let depInfo = await HR_DepartmentDetails.findOne({ comId: com_id, depId: infoDepParent[i]._id })

                        if (depInfo && depInfo.description != null) {
                            infoDep.description = depInfo.description
                        } else infoDep.description = "chưa cập nhật"

                        let countEmpDep = await Users.countDocuments({
                            type: 2,
                            "inForPerson.employee.com_id": com_id,
                            "inForPerson.employee.dep_id": infoDepParent[i]._id
                        })
                        infoDep.total_emp = countEmpDep

                        let countEmpDepDD = await Tracking.countDocuments({ companyId: com_id, depID: infoDepParent[i]._id, shiftID: shiftID, CreateAt: { $gte: inputOld, $lte: inputNew } })
                        infoDep.tong_nv_da_diem_danh = countEmpDepDD

                        result.infoCompany.infoDep.push(infoDep)

                        //thông tin tổ công ty cha
                        let infoTeamParent = await Team.find({ deparmentId: infoDepParent[i]._id }, { _id: 1, teamName: 1 })
                        result.infoCompany.infoDep[i].infoTeam = []
                        for (let j = 0; j < infoTeamParent.length; j++) {
                            let infoTeamMota = await HR_NestDetails.findOne({ grId: infoTeamParent[j]._id, type: 0, comId: com_id }, { description: 1 })
                            infoTeam = {}
                            infoTeam.gr_id = infoTeamParent[j]._id
                            infoTeam.gr_name = infoTeamParent[j].teamName
                            if (infoTeamMota && infoTeamMota.description != null) {
                                infoTeam.description = infoTeamMota.description
                            } else infoTeam.description = "chưa cập nhật"
                            let infoToTruong = await Users.findOne({
                                type: 2,
                                "inForPerson.employee.com_id": com_id,
                                "inForPerson.employee.dep_id": infoDepParent[i]._id,
                                "inForPerson.employee.position_id": 13,
                                "inForPerson.employee.team_id": infoTeamParent[j]._id
                            }, { userName: 1 })
                            if (infoToTruong) {
                                infoTeam.to_truong = infoToTruong.userName
                            } else infoTeam.to_truong = "chưa cập nhật"

                            let infoPhoToTruong = await Users.findOne({
                                type: 2,
                                "inForPerson.employee.com_id": com_id,
                                "inForPerson.employee.dep_id": infoDepParent[i]._id,
                                "inForPerson.employee.position_id": 12,
                                "inForPerson.employee.team_id": infoTeamParent[j]._id
                            }, { userName: 1 })
                            if (infoPhoToTruong) {
                                infoTeam.pho_to_truong = infoPhoToTruong.userName
                            } else infoTeam.pho_to_truong = "chưa cập nhật"

                            let countEmpTeam = await Users.countDocuments({
                                type: 2,
                                "inForPerson.employee.com_id": com_id,
                                "inForPerson.employee.dep_id": infoDepParent[i]._id,
                                "inForPerson.employee.team_id": infoTeamParent[j]._id
                            })
                            infoTeam.tong_nv = countEmpTeam
                            result.infoCompany.infoDep[i].infoTeam.push(infoTeam)

                            //thông tin nhóm công ty cha
                            let infoGroupParent = await Group.find({ teamId: infoTeamParent[j]._id, depId: infoDepParent[i]._id }, { _id: 1, groupName: 1 })

                            result.infoCompany.infoDep[i].infoTeam[j].infoGroup = []
                            for (let k = 0; k < infoGroupParent.length; k++) {
                                let infoGroupMota = await HR_NestDetails.findOne({ grId: infoGroupParent[k]._id, type: 1, comId: com_id }, { description: 1 })
                                infoGroup = {}
                                infoGroup.gr_id = infoGroupParent[k]._id
                                infoGroup.gr_name = infoGroupParent[k].groupName
                                if (infoGroupMota && infoGroupMota.description != null) {
                                    infoGroup.description = infoGroupMota.description
                                } else infoGroup.description = "chưa cập nhật"
                                let infoNhomTruong = await Users.findOne({
                                    type: 2,
                                    "inForPerson.employee.com_id": com_id,
                                    "inForPerson.employee.dep_id": infoDepParent[i]._id,
                                    "inForPerson.employee.position_id": 4,
                                    "inForPerson.employee.team_id": infoTeamParent[j]._id,
                                    "inForPerson.employee.group_id": infoGroupParent[k]._id
                                }, { userName: 1 })
                                if (infoNhomTruong) {
                                    infoGroup.truong_nhom = infoNhomTruong.userName
                                } else infoGroup.truong_nhom = "chưa cập nhật"

                                let infoPhoNhomTruong = await Users.findOne({
                                    type: 2,
                                    "inForPerson.employee.com_id": com_id,
                                    "inForPerson.employee.dep_id": infoDepParent[i]._id,
                                    "inForPerson.employee.position_id": 20,
                                    "inForPerson.employee.team_id": infoTeamParent[j]._id,
                                    "inForPerson.employee.group_id": infoGroupParent[k]._id
                                }, { userName: 1 })
                                if (infoPhoNhomTruong) {
                                    infoGroup.pho_truong_nhom = infoPhoNhomTruong.userName
                                } else infoGroup.pho_truong_nhom = "chưa cập nhật"

                                let countEmpGroup = await Users.countDocuments({
                                    type: 2,
                                    "inForPerson.employee.com_id": com_id,
                                    "inForPerson.employee.dep_id": infoDepParent[i]._id,
                                    "inForPerson.employee.team_id": infoTeamParent[j]._id,
                                    "inForPerson.employee.group_id": infoGroupParent[k]._id
                                })
                                infoGroup.group_tong_nv = countEmpGroup
                                result.infoCompany.infoDep[i].infoTeam[j].infoGroup.push(infoGroup)

                            }
                        }
                    }
                }

                //thông tin công ty con
                let infoChildCompany = await Users.find({
                    type: 1,
                    "inForCompany.cds.com_parent_id": com_id
                }, { _id: 1, idQLC: 1, userName: 1 })

                if (infoChildCompany) {
                    result.infoCompany.infoChildCompany = []
                    for (let i = 0; i < infoChildCompany.length; i++) {
                        let infochild = {}
                        infochild.com_id = infoChildCompany[i].idQLC
                        let countChildEmp = await Users.countDocuments({
                            type: 2,
                            "inForPerson.employee.com_id": infoChildCompany[i].idQLC
                        })
                        infochild.com_name = infoChildCompany[i].userName
                        infochild.tong_nv = countChildEmp

                        let countChildEmpDD = await Tracking.countDocuments({ companyId: infoChildCompany[i].idQLC, shiftID: shiftID, CreateAt: { $gte: inputOld, $lte: inputNew } })
                        infochild.tong_nv_da_diem_danh = countChildEmpDD

                        let infoChildGiamDoc = await Users.findOne({
                            type: 2,
                            "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                            "inForPerson.employee.position_id": 8
                        }, { userName: 1 })
                        let infoChildPhoGiamDoc = await Users.findOne({
                            type: 2,
                            "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                            "inForPerson.employee.position_id": 7
                        }, { userName: 1 })

                        if (infoChildGiamDoc) {
                            infochild.manager = infoChildGiamDoc.userName
                        } else infochild.manager = "Chưa cập nhật"
                        if (infoChildPhoGiamDoc) {
                            infochild.deputy = infoChildPhoGiamDoc.userName
                        } else infochild.deputy = "Chưa cập nhật"
                        result.infoCompany.infoChildCompany.push(infochild)

                        //thông tin phòng ban con
                        let infoDepChild = await Deparment.find({ companyId: infoChildCompany[i].idQLC })
                        if (infoDepChild) {
                            result.infoCompany.infoChildCompany[i].infoDep = []

                            for (let j = 0; j < infoDepChild.length; j++) {
                                let infoDep = {}
                                infoDep.dep_id = infoDepChild[j]._id
                                infoDep.dep_name = infoDepChild[j].deparmentName
                                let infoTruongphong = await Users.findOne({
                                    type: 2,
                                    "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                    "inForPerson.employee.dep_id": infoDepChild[j]._id,
                                    "inForPerson.employee.position_id": 6
                                }, { userName: 1 })

                                if (infoTruongphong) {
                                    infoDep.manager = infoTruongphong.userName
                                } else infoDep.manager = "chưa cập nhât"

                                let infoPhophong = await Users.findOne({
                                    type: 2,
                                    "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                    "inForPerson.employee.dep_id": infoDepChild[j]._id,
                                    "inForPerson.employee.position_id": 5
                                }, { userName: 1 })

                                if (infoPhophong) {
                                    infoDep.deputy = infoPhophong.userName
                                } else infoDep.deputy = "chưa cập nhât"

                                let depInfo = await HR_DepartmentDetails.findOne({ comId: infoChildCompany[i].idQLC, depId: infoDepChild[i]._id })

                                if (depInfo && depInfo.description != null) {
                                    infoDep.description = depInfo.description

                                } else infoDep.description = "chưa cập nhật"

                                let countEmp = await Users.countDocuments({
                                    type: 2,
                                    "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                    "inForPerson.employee.dep_id": infoDepChild[j]._id
                                })
                                infoDep.tong_nv = countEmp

                                let countEmpDepChildDD = await Tracking.countDocuments({ companyId: infoChildCompany[i].idQLC, depID: infoDepChild[j]._id, shiftID: shiftID, CreateAt: { $gte: inputOld, $lte: inputNew } })

                                infoDep.tong_nv_da_diem_danh = countEmpDepChildDD
                                result.infoCompany.infoChildCompany[i].infoDep.push(infoDep)

                                //thông tin tổ công ty con
                                let infoTeamChild = await Team.find({ deparmentId: infoDepChild[j]._id }, { _id: 1, teamName: 1 })
                                result.infoCompany.infoChildCompany[i].infoDep[j].infoTeam = []
                                for (let k = 0; k < infoTeamChild.length; k++) {
                                    let infoTeamMota = await HR_NestDetails.findOne({
                                        grId: infoTeamChild[k]._id,
                                        type: 0,
                                        comId: infoChildCompany[i].idQLC
                                    }, { description: 1 })
                                    infoTeam = {}
                                    infoTeam.gr_id = infoTeamChild[k]._id
                                    infoTeam.gr_name = infoTeamChild[k].teamName
                                    if (infoTeamMota && infoTeamMota.description != null) {
                                        infoTeam.description = infoTeamMota.description
                                    } else infoTeam.description = "chưa cập nhật"

                                    let infoToTruong = await Users.findOne({
                                        type: 2,
                                        "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                        "inForPerson.employee.dep_id": infoDepChild[j]._id,
                                        "inForPerson.employee.position_id": 13,
                                        "inForPerson.employee.team_id": infoTeamChild[k]._id
                                    }, { userName: 1 })
                                    if (infoToTruong) {
                                        infoTeam.to_truong = infoToTruong.userName
                                    } else infoTeam.to_truong = "chưa cập nhật"

                                    let infoPhoToTruong = await Users.findOne({
                                        type: 2,
                                        "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                        "inForPerson.employee.dep_id": infoDepChild[j]._id,
                                        "inForPerson.employee.position_id": 12,
                                        "inForPerson.employee.team_id": infoTeamChild[k]._id
                                    }, { userName: 1 })
                                    if (infoPhoToTruong) {
                                        infoTeam.pho_to_truong = infoPhoToTruong.userName
                                    } else infoTeam.pho_to_truong = "chưa cập nhật"

                                    let countEmpTeam = await Users.countDocuments({
                                        type: 2,
                                        "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                        "inForPerson.employee.dep_id": infoDepChild[j]._id,
                                        "inForPerson.employee.team_id": infoTeamChild[k]._id
                                    })
                                    infoTeam.tong_nv = countEmpTeam
                                    result.infoCompany.infoChildCompany[i].infoDep[j].infoTeam.push(infoTeam)

                                    //thông tin nhóm công ty con
                                    let infoGroupChild = await Group.find({ teamId: infoTeamChild[k]._id, depId: infoDepChild[j]._id }, { _id: 1, groupName: 1 })
                                    result.infoCompany.infoChildCompany[i].infoDep[j].infoTeam[k].infoGroup = []
                                    for (let l = 0; l < infoGroupChild.length; l++) {
                                        let infoGroupMota = await HR_NestDetails.findOne({ grId: infoGroupChild[k]._id, type: 1, comId: infoChildCompany[i].idQLC }, { description: 1 })
                                        infoGroup = {}
                                        infoGroup.gr_id = infoGroupChild[l]._id
                                        infoGroup.gr_name = infoGroupChild[l].groupName
                                        if (infoGroupMota && infoGroupMota.description != null) {
                                            infoGroup.description = infoGroupMota.description
                                        } else infoGroup.description = "chưa cập nhật"
                                        let infoNhomTruong = await Users.findOne({
                                            type: 2,
                                            "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                            "inForPerson.employee.dep_id": infoDepChild[j]._id,
                                            "inForPerson.employee.position_id": 4,
                                            "inForPerson.employee.team_id": infoTeamChild[k]._id,
                                            "inForPerson.employee.group_id": infoGroupChild[l]._id
                                        }, { userName: 1 })
                                        if (infoNhomTruong) {
                                            infoGroup.truong_nhom = infoNhomTruong.userName
                                        } else infoGroup.truong_nhom = "chưa cập nhật"

                                        let infoPhoNhomTruong = await Users.findOne({
                                            type: 2,
                                            "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                            "inForPerson.employee.dep_id": infoDepChild[j]._id,
                                            "inForPerson.employee.position_id": 20,
                                            "inForPerson.employee.team_id": infoTeamChild[k]._id,
                                            "inForPerson.employee.group_id": infoGroupChild[l]._id
                                        }, { userName: 1 })
                                        if (infoPhoNhomTruong) {
                                            infoGroup.pho_truong_nhom = infoPhoNhomTruong.userName
                                        } else infoGroup.pho_truong_nhom = "chưa cập nhật"

                                        let countEmpGroup = await Users.countDocuments({
                                            type: 2,
                                            "inForPerson.employee.com_id": infoChildCompany[i].idQLC,
                                            "inForPerson.employee.dep_id": infoDepChild[j]._id,
                                            "inForPerson.employee.team_id": infoTeamChild[k]._id,
                                            "inForPerson.employee.group_id": infoGroupChild[l]._id
                                        })
                                        infoGroup.group_tong_nv = countEmpGroup
                                        result.infoCompany.infoChildCompany[i].infoDep[j].infoTeam[k].infoGroup.push(infoGroup)
                                    }
                                }
                            }
                        }
                    }
                }
            } else return functions.setError(res, "không tìm thấy công ty này", 400);

            return functions.success(res, 'Lấy chi tiết công ty thành công', result);
        } else return functions.setError(res, "Thông tin truyền lên không đầy đủ", 400);


    } catch (e) {
        console.log("Đã có lỗi xảy ra khi lấy chi tiết công ty", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//hiển thị mô tả chi tiết của phòng ban, tổ trong công ty
exports.description = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let comId = req.infoLogin.comId;
            let depId = Number(req.body.depId)
            let teamId = Number(req.body.teamId)
            let groupId = Number(req.body.groupId)
            let info

            if (groupId) {
                info = await HR_NestDetails.findOne({ comId: comId, grId: groupId, type: 1 }, { description: 1, id: 1 })
            }
            if (teamId && !groupId) {
                info = await HR_NestDetails.findOne({ comId: comId, grId: teamId, type: 0 }, { description: 1, id: 1 })
            }
            if (depId && !teamId && !groupId) {

                info = await HR_DepartmentDetails.findOne({ comId: comId, depId: depId }, { description: 1, id: 1 })
            }
            if (info && info.description == null) {
                info.description = "chưa cập nhật"
            }
            if (info) {
                return functions.success(res, 'Lấy chi tiết công ty thành công', { info });
            } else return functions.setError(res, "không tìm thấy thông tin", 400);
        } else return functions.setError(res, "Thông tin truyền lên không đầy đủ", 400);


    } catch (e) {
        console.log("Đã có lỗi xảy ra khi lấy chi tiết công ty", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }

}

exports.updateDescription = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let comId = req.infoLogin.comId;
            let depId = Number(req.body.depId)
            let teamId = Number(req.body.teamId)
            let groupId = Number(req.body.groupId)
            let des = req.body.description
            let info

            if (groupId) {
                info = await HR_NestDetails.findOneAndUpdate({ comId: comId, grId: groupId, type: 1 }, { description: des }, { new: true })
            }
            if (teamId && !groupId) {
                info = await HR_NestDetails.findOneAndUpdate({ comId: comId, grId: teamId, type: 0 }, { description: des }, { new: true })
            }
            if (depId && !teamId && !groupId) {

                info = await HR_DepartmentDetails.findOneAndUpdate({ comId: comId, depId: depId }, { description: des }, { new: true })
            }
            if (info) {
                return functions.success(res, 'Cập nhật mô tả chi tiết thành công', { info });
            } else return functions.setError(res, "không tìm thấy thông tin", 400);
        } else return functions.setError(res, "Thông tin truyền lên không đầy đủ", 400);


    } catch (e) {
        console.log("Đã có lỗi xảy ra khi lấy chi tiết công ty", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }

}

//danh sách chức vụ
exports.listPosition = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let comId = req.infoLogin.comId;
            //tìm kiếm những chức vụ của công ty đó trong bảng hr
            const positionOrder = {
                19: 1,
                18: 2,
                17: 3,
                21: 4,
                22: 5,
                16: 6,
                14: 7,
                8: 8,
                7: 9,
                6: 10,
                5: 11,
                13: 12,
                12: 13,
                4: 14,
                20: 15,
                11: 16,
                10: 17,
                3: 18,
                2: 19,
                9: 20,
                1: 21
            };

            const companyPositions = await HR_DescPositions.find({ comId: comId });

            const sortedPositions = companyPositions.sort((a, b) => {
                const orderA = positionOrder[a.positionId] || Infinity;
                const orderB = positionOrder[b.positionId] || Infinity;
                return orderA - orderB;
            });

            const result = sortedPositions.map((position) => {
                return {
                    positionId: position.positionId,
                    positionName: positionNames[position.positionId] || 'Chức vụ không xác định',
                    des: position.description || 'Chưa cập nhật',
                    users: {
                        userName: [],
                        id: [],
                    },
                };
            });
            for (let i = 0; i < result.length; i++) {
                let findUser = await Users.find({
                    "inForPerson.employee.com_id": comId,
                    "inForPerson.employee.position_id": result[i].positionId
                }, { idQLC: 1, userName: 1 })
                result[i].users.userName = findUser.map((user) => user.userName);
                result[i].users.id = findUser.map((user) => user.idQLC);
            }
            if (result) {
                return functions.success(res, 'Lấy chi tiết công ty thành công', { result });
            } else return functions.setError(res, "Cty không có nhân viên hoặc chưa có dữ liệu về chức vụ", 400);
        } else return functions.setError(res, "Thông tin truyền lên không đầy đủ", 400);


    } catch (e) {
        console.log("Đã có lỗi xảy ra khi lấy chi tiết công ty", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }

}

//chi tiết nhiệm vụ mỗi chức vụ
exports.missionDetail = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let comId = req.infoLogin.comId;

            let positionId = req.body.positionId
            let mission = await HR_DescPositions.findOne({ comId: comId, positionId: positionId }, { description: 1 })
            if (mission) {
                if (mission.description != null) {
                    return functions.success(res, 'Lấy chi tiết công ty thành công', { mission });
                } else {
                    mission.description = "chưa cập nhật"
                    return functions.success(res, 'Lấy chi tiết công ty thành công', { mission });
                }
            } else return functions.setError(res, "chưa cập nhật nhiệm vụ", 400);
        } else return functions.setError(res, "Thông tin truyền lên không đầy đủ", 400);


    } catch (e) {
        console.log("Đã có lỗi xảy ra khi lấy chi tiết công ty", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }

}

//cập nhật chi tiết nhiệm vụ mỗi
exports.updateMission = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let comId = req.infoLogin.comId;

            let positionId = req.body.positionId
            let description = req.body.description
            if (!positionId || !description) {
                return functions.setError(res, "Missing input value!", 404);
            }
            let mission = await HR_DescPositions.findOneAndUpdate({ comId: comId, positionId: positionId }, { description: description }, { new: true })
            if (mission) {
                return functions.success(res, 'cập nhật chi tiết nhiệm vụ thành công', { mission });

            } else return functions.setError(res, "chưa cập nhật nhiệm vụ", 400);
        } else return functions.setError(res, "Thông tin truyền lên không đầy đủ", 400);

    } catch (e) {
        console.log("Đã có lỗi xảy ra khi lấy chi tiết công ty", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }

}

//tải lên chữ ký
exports.uploadSignature = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let empId = req.body.empId

            const maxID = await HR_SignatureImages.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
            if (maxID) {
                newIDMax = Number(maxID.id) + 1;
            } else newIDMax = 1
            let file = req.files.signature;
            if (!file) {
                return functions.setError(res, "Missing signature image!", 504);
            }
            if (!await functions.checkImage(file.path)) {
                return functions.setError(res, "Anh khong dung dinh dang hoac qua kich thuoc!", 505);
            }
            let nameFile = await hrFunctions.uploadFileSignature(file);
            let checkSig = await HR_SignatureImages.findOne({ empId: empId })
            if (!checkSig) {
                let upload = new HR_SignatureImages({
                    id: newIDMax,
                    empId: empId,
                    imgName: nameFile,
                    createdAt: new Date(Date.now())
                })
                upload.save()
                if (upload) {
                    return functions.success(res, 'Tải chữ ký thành công');
                }
            } else return functions.setError(res, "Đã tồn tại chữ ký của người này", 400);

        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra khi tải lên hồ sơ", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//xóa chữ kí đã tải lên
exports.deleteSignature = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let empId = req.body.empId
            let deleteSig = await HR_SignatureImages.findOneAndUpdate({ empId: empId }, { isDelete: 1, deletedAt: new Date(Date.now()) })

            if (deleteSig) {
                return functions.success(res, 'Xóa chữ ký thành công');
            }
            return functions.setError(res, "Employee not found!");
        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra khi tải lên hồ sơ", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//danh sách, tìm kiếm lãnh đạo
exports.listInfoLeader = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let keyword = req.body.keyword
            let comId = req.infoLogin.comId
            let page = Number(req.body.page)
            let pageSize = Number(req.body.pageSize)
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            let listPositionId = [4, 20, 13, 12, 11, 10, 6, 5, 8, 7, 16, 14, 21, 22, 19, 18, 17]
            let infoLeader = await Users.find({
                userName: new RegExp(keyword, "i"),
                "inForPerson.employee.com_id": comId,
                "inForPerson.employee.position_id": { $in: listPositionId }
            }, {
                idQLC: 1,
                avatarUser: 1,
                userName: 1,
                "inForPerson.employee.position_id": 1,
                "inForPerson.employee.dep_id": 1,
                "inForPerson.employee.team_id": 1,
                "inForPerson.employee.group_id": 1,
            }).skip(skip).limit(limit)

            let infoLeaderAfter = []
            for (let i = 0; i < infoLeader.length; i++) {
                let info = {}
                info._id = infoLeader[i].idQLC
                info.userName = infoLeader[i].userName
                info.avatarUser = `${process.env.hostFile}${infoLeader[i].avatarUser}`
                info.namePosition = positionNames[infoLeader[i].inForPerson.employee.position_id];

                if (infoLeader[i].inForPerson.employee.dep_id) {
                    let infoDep = await Deparment.findOne({ _id: infoLeader[i].inForPerson.employee.dep_id, com_id: comId })
                    info.dep_name = infoDep.deparmentName

                    if (infoLeader[i].inForPerson.employee.team_id) {
                        let infoTeam = await Team.findOne({
                            _id: infoLeader[i].inForPerson.employee.team_id,
                            com_id: comId,
                            dep_id: infoLeader[i].inForPerson.employee.dep_id,
                        })
                        info.team_name = infoTeam.teamName

                        if (infoLeader[i].inForPerson.employee.group_id) {
                            let infoGroup = await Group.findOne({
                                _id: infoLeader[i].inForPerson.employee.group_id,
                                com_id: comId,
                                dep_id: infoLeader[i].inForPerson.employee.dep_id,
                                team_id: infoLeader[i].inForPerson.employee.team_id
                            })
                            info.group_name = infoGroup.teamName
                        } else info.group_name = "chưa cập nhật"


                    } else {
                        info.team_name = "chưa cập nhật"
                        info.group_name = "chưa cập nhật"
                    }

                } else {
                    info.dep_name = "chưa cập nhật"
                    info.team_name = "chưa cập nhật"
                    info.group_name = "chưa cập nhật"
                }
                infoLeaderAfter.push(info)
            }

            if (infoLeader) {
                return functions.success(res, 'hiển thị danh sách lãnh đạo thành công', { infoLeaderAfter });
            }
        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra khi tải lên hồ sơ", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//chi tiết lãnh đạo
exports.leaderDetail = async(req, res, next) => {
    try {
        if (req.infoLogin && req.body.empId) {
            let empId = req.body.empId
            let description = req.body.description
            let result = {}
            let infoUser = await Users.findOne({ idQLC: empId, type: 2 })

            if (infoUser) {
                let infoUserHr = await HR_InfoLeaders.findOne({ epId: empId })
                if (infoUserHr) {
                    result.ep_name = infoUser.userName
                    result.namePosition = positionNames[infoUser.inForPerson.employee.position_id]
                    result.avatarUser = `${process.env.hostFile}${infoUser.avatarUser}`
                    result.description = infoUserHr.description

                    if (result) {
                        return functions.success(res, 'hiển thị danh sách lãnh đạo thành công', { result });
                    }
                } else {
                    const maxID = await HR_InfoLeaders.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
                    if (maxID) {
                        newIDMax = Number(maxID.id) + 1;
                    } else newIDMax = 1
                    let desPosition = 0;
                    if (infoUser && infoUser.inForPerson && infoUser.inForPerson.employee && infoUser.inForPerson.employee.position_id) desPosition = infoUser.inForPerson.employee.position_id
                    let insertUser = new HR_InfoLeaders({
                        id: newIDMax,
                        epId: empId,
                        avatar: (infoUser.avatarUser ? infoUser.avatarUse : null),
                        description: description,
                        desPosition: desPosition,
                        created_at: new Date(Date.now())
                    })
                    insertUser.save()
                    if (insertUser) {
                        return functions.success(res, 'cập nhật chi tiết lãnh đạo thành công');
                    } else {
                        return functions.setError(res, 'update info leader fail!');
                    }
                }

            } else functions.setError(res, "không tìm thấy thông tin user", 400);

        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra khi tải lên hồ sơ", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//cập nhật chi tiết lãnh đạo
exports.updateLeaderDetail = async(req, res, next) => {
    try {
        if (req.infoLogin && req.body.empId) {
            let empId = req.body.empId
            let description = req.body.description
            if (!description) {
                return functions.setError(res, "Missing input description!");
            }

            let updateUserHr = await HR_InfoLeaders.findOneAndUpdate({ epId: empId }, { description: description, updated_at: new Date(Date.now()) }, { new: true })

            if (updateUserHr) {
                return functions.success(res, 'cập nhật chi tiết lãnh đạo thành công', { updateUserHr });
            }
        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra khi tải lên hồ sơ", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//Thêm mới nhân viên sử dụng con dấu
exports.updateEmpUseSignature = async(req, res, next) => {
    try {
        if (req.infoLogin && req.body.empId) {
            let comId = req.infoLogin.comId;
            let empId = req.body.empId
            let depId = req.body.depId
            let positionId = req.body.positionId

            let query = {
                idQLC: empId,
                type: 2,
                "inForPerson.employee.com_id": comId
            }
            if (depId) {
                query = {
                    idQLC: empId,
                    type: 2,
                    "inForPerson.employee.com_id": comId,
                    "inForPerson.employee.dep_id": depId
                }

            }
            if (positionId) {
                query = {
                    idQLC: empId,
                    type: 2,
                    "inForPerson.employee.com_id": comId,
                    "inForPerson.employee.dep_id": depId,
                    "inForPerson.employee.position_id": position_id
                }
            }

            if (depId && positionId) {
                query = {
                    idQLC: empId,
                    type: 2,
                    "inForPerson.employee.com_id": comId,
                    "inForPerson.employee.dep_id": depId,
                    "inForPerson.employee.position_id": position_id,
                    "inForPerson.employee.dep_id": depId
                }
            }
            let updateUserHr = await Users.findOneAndUpdate(query, {
                "inForPerson.employee.ep_signature": 1,
                updatedAt: new Date(Date.now())
            }, { new: true })

            if (updateUserHr) {
                return functions.success(res, 'cập nhật người sử dụng con dấu thành công');
            } else {
                return functions.setError(res, "Employee not found!", 505);
            }
        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//Danh sách nhân viên sử dụng con dấu (có tìm kiếm)
exports.listEmpUseSignature = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let keyword = req.body.keyword

            let comId = req.infoLogin.comId;
            let infoUser
            if (isNaN(keyword) == true) {
                infoUser = await Users.findOne({
                    userName: new RegExp(keyword, "i"),
                    "inForPerson.employee.com_id": comId,
                    "inForPerson.employee.ep_signature": 1
                }, {
                    idQLC: 1,
                    avatarUser: 1,
                    userName: 1,
                    "inForPerson.employee.position_id": 1,
                    "inForPerson.employee.dep_id": 1,
                })
            } else if (isNaN(keyword) == false) {

                infoUser = await Users.findOne({
                    idQLC: keyword,
                    "inForPerson.employee.com_id": comId,
                    "inForPerson.employee.ep_signature": 1
                }, {
                    idQLC: 1,
                    avatarUser: 1,
                    userName: 1,
                    "inForPerson.employee.position_id": 1,
                    "inForPerson.employee.dep_id": 1,
                })
            }

            if (infoUser) {
                let info = {}
                info._id = infoUser.idQLC
                info.userName = infoUser.userName
                info.namePosition = positionNames[infoUser.inForPerson.employee.position_id];

                if (infoUser.inForPerson.employee.dep_id) {
                    let infoDep = await Deparment.findOne({ _id: infoUser.inForPerson.employee.dep_id, com_id: comId });
                    if (infoDep && infoDep.deparmentName) {
                        info.dep_name = infoDep.deparmentName
                    }

                } else {
                    info.dep_name = "chưa cập nhật"
                }
                return functions.success(res, 'hiển thị danh sách lãnh đạo thành công', { info });
            } else return functions.setError(res, "không tim thấy user này", 400);
        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra khi tải lên hồ sơ", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//Xóa nhân viên sử dụng con dấu
exports.deleteEmpUseSignature = async(req, res, next) => {
    try {
        if (req.infoLogin && req.body.empId) {
            let comId = req.infoLogin.comId;
            let empId = req.body.empId;

            let updateUserHr = await Users.findOneAndUpdate({
                idQLC: empId,
                type: 2,
                "inForPerson.employee.com_id": comId
            }, {
                "inForPerson.employee.ep_signature": 0,
                updatedAt: new Date(Date.now())
            }, { new: true })

            if (updateUserHr) {
                return functions.success(res, 'xóa người sử dụng con dấu thành công');
            } else {
                return functions.setError(res, "Emplyee not found!", 505);
            }
        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}

//danh sách, tìm kiếm chữ ký lãnh đạo
exports.listSignatureLeader = async(req, res, next) => {
    try {
        if (req.infoLogin) {
            let keyword = req.body.keyword
            let comId = req.infoLogin.comId
            let page = Number(req.body.page)
            let pageSize = Number(req.body.pageSize)
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            let listPositionId = [4, 20, 13, 12, 11, 10, 6, 5, 8, 7, 16, 14, 21, 22, 19, 18, 17]
            let infoLeader
            if (isNaN(keyword) == true) {
                infoLeader = await Users.find({
                    userName: new RegExp(keyword, "i"),
                    "inForPerson.employee.com_id": comId,
                    "inForPerson.employee.position_id": { $in: listPositionId }
                }, {
                    idQLC: 1,
                    userName: 1,
                    "inForPerson.employee.position_id": 1,
                    "inForPerson.employee.dep_id": 1,
                }).skip(skip).limit(limit)
            } else if (isNaN(keyword) == false) {
                infoLeader = await Users.find({
                    idQLC: keyword,
                    "inForPerson.employee.com_id": comId,
                    "inForPerson.employee.position_id": { $in: listPositionId }
                }, {
                    idQLC: 1,
                    userName: 1,
                    "inForPerson.employee.position_id": 1,
                    "inForPerson.employee.dep_id": 1,
                }).skip(skip).limit(limit)
            }

            if (infoLeader) {
                let infoLeaderAfter = []
                for (let i = 0; i < infoLeader.length; i++) {
                    let info = {}
                    info._id = infoLeader[i].idQLC
                    info.userName = infoLeader[i].userName
                    info.namePosition = positionNames[infoLeader[i].inForPerson.employee.position_id];

                    if (infoLeader[i].inForPerson.employee.dep_id) {
                        let infoDep = await Deparment.findOne({ _id: infoLeader[i].inForPerson.employee.dep_id, com_id: comId })
                        info.dep_name = infoDep.deparmentName
                    } else {
                        info.dep_name = "chưa cập nhật"
                    }

                    let infoSig = await HR_SignatureImages.findOne({ empId: infoLeader[i].idQLC }, { imgName: 1 })
                    if (infoSig) {
                        info.linkSignature = `${process.env.hostFile}storage/hr/upload/signature/${infoSig.imgName}`
                    } else info.linkSignature = "chưa cập nhật"

                    infoLeaderAfter.push(info)
                }
                return functions.success(res, 'hiển thị danh sách lãnh đạo thành công', { infoLeaderAfter });
            }
            return functions.setError(res, "không tìm thấy lãnh đạo nào", 400);
        } else {
            return functions.setError(res, "Token không hợp lệ hoặc thông tin truyền lên không đầy đủ", 400);
        }
    } catch (e) {
        console.log("Đã có lỗi xảy ra khi tải lên hồ sơ", e);
        return functions.setError(res, "Đã có lỗi xảy ra", 400);
    }
}