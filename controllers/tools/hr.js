const functions = require('../../services/functions');
//const Recruitment = require('../../models/hr/Recruitments.js');
const HR_AchievementFors = require('../../models/hr/AchievementFors');
const HR_AddInfoLeads = require('../../models/hr/AddInfoLeads');
const HR_Blogs = require('../../models/hr/Blogs');
const HR_Categorys = require('../../models/hr/Categorys');
const HR_CiSessions = require('../../models/hr/CiSessions');
const HR_Citys = require('../../models/hr/Citys');
const HR_CrontabQuitJobs = require('../../models/hr/CrontabQuitJobs');
const HR_Candidates = require('../../models/hr/Candidates');
const HR_EmployeePolicys = require('../../models/hr/EmployeePolicys');
const HR_EmployeePolicySpecifics = require('../../models/hr/EmployeePolicySpecifics');

const HR_DepartmentDetails = require('../../models/hr/DepartmentDetails');
const HR_DescPositions = require('../../models/hr/DescPositions');
const HR_Devices = require('../../models/hr/Devices');
const HR_InfoLeaders = require('../../models/hr/InfoLeaders');
const HR_InfringesFors = require('../../models/hr/InfringesFors');
const FormData = require('form-data');
const axios = require('axios');
// const { formRadioButton } = require('pdfkit');
const JobDes = require('../../models/hr/JobDescriptions');
const AnotherSkill = require('../../models/hr/AnotherSkill');
const PermisionDetail = require('../../models/hr/PermisionDetail');
const Remind = require('../../models/hr/Remind');
const ProcessInterview = require('../../models/hr/ProcessInterview');
const ProcessTraining = require('../../models/hr/ProcessTraining');
const SignatureImage = require('../../models/hr/SignatureImage');
const InviteInterview = require('../../models/hr/InviteInterview');
const ScheduleInterview = require('../../models/hr/ScheduleInterview');
const Recruitment = require('../../models/hr/Recruitment');
const RecruitmentNews = require('../../models/hr/RecruitmentNews');

const HR_Cancel = require('../../models/hr/CancelJob.js');
const HR_FailJob = require('../../models/hr/FailJob.js');
const HR_ContactJob = require('../../models/hr/ContactJob.js');
const HR_Notifys = require('../../models/hr/Notify.js');
const HR_Permisions = require('../../models/hr/Permision.js');
const HR_Policys = require('../../models/hr/Policys.js');
const HR_StageRecruitments = require('../../models/hr/StageRecruitment.js');

// tool hr cường
exports.AchievementFors = async(req, res, next) => {
        try {
            let page = 1;
            let result = true;
            while (result) {
                let data = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_achievements_for?page=${page}`);
                let listUser = [];
                if (data.length === 0) {
                    result = false
                }

                for (let i = 0; i < data.length; i++) {
                    let id = Number(data[i].id);
                    let achievementId = data[i].achievement_id;
                    if (data[i].list_user) {
                        for (let j = 0; j < data[i].list_user.split(',').length; j++) {
                            listUser.push({ userId: data[i].list_user.split(',')[j], name: data[i].list_user_name.split(',')[j] });
                        }
                    }
                    let content = data[i].content;
                    let createdBy = data[i].created_by;
                    let achievementAt = null;
                    if (await functions.checkDate(data[i].achievement_at) === true) {
                        achievementAt = data[i].achievement_at;
                    }
                    let achievementType = data[i].achievement_type;
                    let appellation = data[i].appellation;
                    let achievementLevel = data[i].achievement_level;
                    let type = data[i].type;
                    let comId = data[i].com_id;
                    let depId = data[i].dep_id;
                    let depName = data[i].dep_name;
                    let createdAt = data[i].created_at;
                    let updatedAt = data[i].updated_at;
                    let AchievementFors = new HR_AchievementFors({
                        id,
                        achievementId,
                        content,
                        createdBy,
                        achievementAt,
                        achievementType,
                        appellation,
                        achievementLevel,
                        type,
                        comId,
                        depId,
                        depName,
                        createdAt,
                        updatedAt,
                        listUser
                    });
                    await AchievementFors.save();
                }
                page++;
                console.log(page)
            }

            return functions.success(res, 'pull data success');
        } catch (error) {
            return functions.setError(res, error.message);
        }
    }
    // cancel job
exports.cancelJob = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        while (result) {
            let data = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_cancel_job?page=${page}`);
            if (data.length === 0) {
                result = false
            }
            for (let i = 0; i < data.length; i++) {
                let id = Number(data[i].id);
                let canId = data[i].can_id;
                let isDelete = data[i].is_delete;
                let deletedAt = data[i].deleted_at;
                let resiredSalary = data[i].resired_salary;
                let salary = data[i].salary;
                let note = data[i].note;
                let status = data[i].status;
                let isSwitch = data[i].is_switch;
                let createdAt = data[i].created_at;
                // const check_id = await HR_Cancel.findById(_id);
                // if (!check_id || check_id.length === 0) {
                let data_recruitment = new HR_Cancel({ id, canId, isDelete, deletedAt, resiredSalary, salary, note, status, isSwitch, createdAt });
                await HR_Cancel.create(data_recruitment);
                // }
            }
            page++;
            console.log(page)
        }

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

// failJob
exports.failJob = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        while (result) {

            let data = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_failed_job?page=${page}`);
            if (data.length === 0) {
                result = false
            }
            for (let i = 0; i < data.length; i++) {
                let id = Number(data[i].id);
                let canId = data[i].can_id;
                let type = data[i].type;
                let isDelete = data[i].is_delete;
                let deletedAt = data[i].deleted_at;
                let note = data[i].note;
                let email = data[i].email;
                let contentsend = data[i].contentsend;
                let isSwitch = data[i].is_switch;
                let createdAt = data[i].created_at;
                // const check_id = await HR_Cancel.findById(_id);
                // if (!check_id || check_id.length === 0) {
                let data_recruitment = new HR_FailJob({ id, canId, isDelete, deletedAt, note, email, contentsend, isSwitch, createdAt });
                await HR_FailJob.create(data_recruitment);
                // }

            }
            page++;
            console.log(page)
        }

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.AddInfoLeads = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        while (result) {
            let data = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_add_info_lead?page=${page}`);
            if (data.length === 0) {
                result = false
            }
            for (let i = 0; i < data.length; i++) {
                let id = Number(data[i].id);
                let epId = data[i].ep_id;
                let nameDes = data[i].name_des;
                let description = Buffer.from(data[i].description, 'base64');
                let createdAt = data[i].created_at;
                let updatedAt = data[i].updated_at;
                let AddInfoLeads = new HR_AddInfoLeads({
                    id,
                    epId,
                    nameDes,
                    description,
                    createdAt,
                    updatedAt
                });
                await AddInfoLeads.save();
            }
            page++;
            console.log(page)
        }

        return functions.success(res, 'pull data success');
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

// ContactJob

exports.contactJob = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        while (result) {
            let data = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_contact_job?page=${page}`);
            if (data.length === 0) {
                result = false
            }
            for (let i = 0; i < data.length; i++) {
                let id = Number(data[i].id);
                let canId = data[i].can_id;
                let isDelete = data[i].is_delete;
                let deletedAt = data[i].deleted_at;
                let resiredSalary = data[i].resired_salary;
                let salary = data[i].salary;
                let offerTime = data[i].offer_time;
                let epOffer = data[i].ep_offer;
                let note = data[i].note;
                let isSwitch = data[i].is_switch;
                let createdAt = data[i].created_at;
                // const check_id = await HR_Cancel.findById(_id);
                // if (!check_id || check_id.length === 0) {
                let data_recruitment = new HR_ContactJob({ id, canId, isDelete, deletedAt, resiredSalary, note, salary, offerTime, epOffer, isSwitch, createdAt });
                await HR_ContactJob.create(data_recruitment);
                // }
            }
            page++;
            console.log(page)
        }

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.Blogs = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        while (result) {
            let data = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_blog?page=${page}`);
            if (data.length === 0) {
                result = false
            }
            for (let i = 0; i < data.length; i++) {
                let id = Number(data[i].id);
                let content = Buffer.from(data[i].content, 'base64');
                let comment = data[i].comment;
                let Blogs = new HR_Blogs({ id, content, comment });
                await Blogs.save();
            }
            page++;
            console.log(page)
        }

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.Categorys = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        while (result) {
            let data = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_category?page=${page}`);
            if (data.length === 0) {
                result = false
            }
            for (let i = 0; i < data.length; i++) {
                let id = Number(data[i].cat_id);
                let name = data[i].cat_name;
                let title = data[i].cat_title;
                let tags = data[i].cat_tags;
                let description = data[i].cat_description;
                let keyword = data[i].cat_keyword;
                let parentId = data[i].cat_parent_id;
                let lq = data[i].cat_lq;
                let count = data[i].cat_count;
                let countVl = data[i].cat_count_vl;
                let order = data[i].cat_order;
                let active = data[i].cat_active;
                let hot = data[i].cat_hot;
                let ut = data[i].cat_ut;
                let only = data[i].cat_only;
                let except = data[i].cat_except;
                let tlq = data[i].cat_tlq;
                let tlqUv = data[i].cat_tlq_uv;

                let Categorys = new HR_Categorys({
                    id,
                    name,
                    title,
                    tags,
                    description,
                    keyword,
                    parentId,
                    lq,
                    count,
                    countVl,
                    order,
                    active,
                    hot,
                    ut,
                    only,
                    except,
                    tlq,
                    tlqUv
                });

                await Categorys.save();
            }
            page++;
            console.log(page)
        }

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.CiSessions = async(req, res, next) => {
    try {
        let data1 = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_ci_sessions`);
        for (let i = 0; i < data1.length; i++) {
            let id = data1[i].id;
            let ipAddress = data1[i].ip_address;
            let timestamp = data1[i].timestamp;
            let data = Buffer.from(data1[i].data, 'base64');

            let CiSessions = new HR_CiSessions({
                id,
                ipAddress,
                timestamp,
                data
            });
            await CiSessions.save();
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.Citys = async(req, res, next) => {
    try {
        let page = 1;
        let result = true;
        while (result) {
            let data = await functions.getDataAxios(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_city2?page=${page}`);
            if (data.length === 0) {
                result = false
            }
            for (let i = 0; i < data.length; i++) {
                let id = Number(data[i].cit_id);

                let name = data[i].cit_name;
                let order = data[i].cit_order;
                let type = data[i].cit_type;
                let count = data[i].cit_count;
                let parentId = data[i].cit_parent;
                let Citys = new HR_Citys({ id, name, order, type, count, parentId });
                await Citys.save();
            }
            page++;
            console.log(page)
        }

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.CrontabQuitJobs = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_achievements_for?page=1');
        let list = [];

        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let achievementId = data[i].achievement_id;
            let content = data[i].content;
            let createdBy = data[i].created_by;
            let achievementAt = null;
            let achievementType = data[i].achievement_type;
            let appellation = data[i].appellation;
            let achievementLevel = data[i].achievement_level;
            let type = data[i].type;
            let comId = data[i].com_id;
            let depId = data[i].dep_id;
            let depName = data[i].dep_name;
            let createdAt = data[i].created_at;
            let updatedAt = data[i].updated_at;
            let AchievementFors = new HR_AchievementFors({
                id,
                achievementId,
                content,
                createdBy,
                achievementAt,
                achievementType,
                appellation,
                achievementLevel,
                type,
                comId,
                depId,
                depName,
                createdAt,
                updatedAt,
                list
            });
            await AchievementFors.save();
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.DepartmentDetails = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_department_detail');
        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let comId = data[i].com_id;
            let depId = data[i].dep_id;
            let description = data[i].description;
            let DepartmentDetails = new HR_DepartmentDetails({ id, comId, depId, description });
            await DepartmentDetails.save();
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.DescPositions = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_desc_position');
        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let positionId = data[i].position_id;
            let comId = data[i].com_id;
            let description = data[i].description;
            let DescPositions = new HR_DescPositions({ id, positionId, comId, description });
            await DescPositions.save();
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.Devices = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_devices');
        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let userId = data[i].user_id;
            let infoBrower = data[i].info_brower;
            let tokenBrowser = data[i].token_browser;
            let lastLogin = data[i].last_login;
            let deviceType = data[i].device_type;
            let loginType = data[i].login_type;
            let createdAt = data[i].created_at;
            let Devices = new HR_Devices({ id, userId, infoBrower, tokenBrowser, lastLogin, deviceType, loginType, createdAt });
            await Devices.save();
        }
        return functions.success(res, 'pull data success');
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.EmployeePolicys = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_employe_policy');
        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let name = data[i].name;
            let timeStart = data[i].time_start;
            let supervisorName = data[i].supervisor_name;
            let description = Buffer.from(data[i].description, 'base64');
            let isDelete = data[i].is_delete;
            let comId = data[i].com_id;
            let file = data[i].file;
            if (await functions.checkDate(timeStart) === false) continue
            let createdAt = data[i].created_at;
            let deletedAt = data[i].deleted_at;
            let EmployeePolicys = new HR_EmployeePolicys({ id, name, timeStart, supervisorName, description, isDelete, comId, file, createdAt, deletedAt });
            await EmployeePolicys.save();
        }
        return functions.success(res, 'pull data success');
    } catch (error) {
        return functions.setError(res, error.message);
    }
}
exports.EmployeePolicySpecifics = async(req, res, next) => {
    try {

        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_employe_policy_specific');

        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let name = data[i].name;
            let timeStart = data[i].time_start;
            let employeePolicyId = data[i].employe_policy_id;
            let supervisorName = data[i].supervisor_name;
            let description = data[i].description;
            let content = data[i].content;
            let applyFor = data[i].apply_for;
            let isDelete = data[i].is_delete;
            let createdBy = data[i].created_by;
            let file = data[i].file;
            let createdAt = data[i].created_at;
            let updated_at = data[i].updated_at;
            let deletedAt = data[i].deleted_at;
            if (await functions.checkDate(timeStart) === false) continue
            let EmployeePolicySpecifics = new HR_EmployeePolicySpecifics({ id, name, applyFor, timeStart, employeePolicyId, supervisorName, description, content, applyFor, isDelete, createdBy, file, createdAt, updated_at, deletedAt });
            await EmployeePolicySpecifics.save();
        }
        return functions.success(res, 'pull data success');
    } catch (error) {
        return functions.setError(res, error.message);
    }
}
exports.Candidates = async(req, res, next) => {
        try {
            let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_candidate');
            for (let i = 0; i < data.length; i++) {
                let id = Number(data[i].id)
                let name = data[i].name
                let email = data[i].email
                let phone = data[i].phone
                let cvFrom = data[i].cv_from
                let userRecommend = data[i].user_recommend
                let recruitmentNewsId = data[i].recruitment_news_id
                let timeSendCv = new Date(data[i].time_send_cv)
                if (await functions.checkDate(timeSendCv) === false) continue
                let interviewTime = data[i].interview_time
                let interviewResult = data[i].interview_result
                let interviewVote = data[i].interview_vote
                let salaryAgree = data[i].salary_agree
                let status = data[i].status
                let cv = data[i].cv
                let createdAt = data[i].created_at
                let updatedAt = data[i].updated_at
                let isDelete = data[i].is_delete
                let comId = data[i].com_id
                let isOfferJob = data[i].is_offer_job
                let gender = data[i].can_gender
                let birthday = data[i].can_birthday
                let education = data[i].can_education
                let exp = data[i].can_exp
                let isMarried = data[i].can_is_married
                let address = data[i].can_address
                let userHiring = data[i].user_hiring
                let starVote = data[i].star_vote
                let school = data[i].school
                let hometown = data[i].hometown
                let isSwitch = data[i].is_switch
                let epIdCrm = data[i].ep_id_crm
                let Candidates = new HR_Candidates({ id, name, email, phone, cvFrom, userRecommend, recruitmentNewsId, timeSendCv, interviewTime, interviewResult, interviewVote, salaryAgree, status, cv, createdAt, updatedAt, isDelete, comId, isOfferJob, gender, birthday, education, exp, isMarried, address, userHiring, starVote, school, hometown, isSwitch, epIdCrm });
                await Candidates.save();
            }
            return functions.success(res, 'pull data success');

        } catch (error) {
            return functions.setError(res, error.message);
        }
    }
    // Notify
exports.notify = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_contact_job?page=1');
        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let canId = data[i].can_id;
            let type = data[i].type;
            let comNotify = data[i].com_notify;
            let comId = data[i].com_id;
            let userId = data[i].user_id;
            let createdAt = data[i].created_at;
            // const check_id = await HR_Cancel.findById(_id);
            // if (!check_id || check_id.length === 0) {
            let data_recruitment = new HR_Notifys({ id, canId, type, comNotify, comId, userId, createdAt });
            await HR_Notifys.create(data_recruitment);
            // }
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.InfoLeaders = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_info_leader');

        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let epId = data[i].ep_id;
            let description = Buffer.from(data[i].description, 'base64');
            let desPosition = data[i].des_position;
            let createdAt = data[i].created_at;
            let updatedAt = data[i].updated_at;
            let InfoLeaders = new HR_InfoLeaders({ id, epId, description, desPosition, createdAt, updatedAt });
            await InfoLeaders.save();
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.InfringesFors = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_infringes_for');
        let listUser = [];

        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let infringeName = data[i].infringe_name;
            if (data[i].list_user) {
                for (let j = 0; j < data[i].list_user.split(',').length; j++) {
                    listUser.push({ userId: data[i].list_user.split(',')[j], name: data[i].list_user_name.split(',')[j] });
                }
            }
            let regulatoryBasis = data[i].regulatory_basis;
            let numberViolation = data[i].number_violation;
            let createdBy = data[i].created_by;
            let infringeAt = data[i].infringe_at;
            if (await functions.checkDate(infringeAt) === false) continue
            let infringeType = data[i].infringe_type;
            let type = data[i].type;
            let comId = data[i].com_id;
            let depId = data[i].dep_id;
            let depName = data[i].dep_name;
            let createdAt = data[i].created_at;
            let updatedAt = data[i].updated_at;
            let InfringesFors = new HR_InfringesFors({
                id,
                infringeName,
                regulatoryBasis,
                numberViolation,
                createdBy,
                infringeAt,
                infringeType,
                type,
                comId,
                depId,
                depName,
                createdAt,
                updatedAt,
                listUser
            });
            await InfringesFors.save();
        }
        return functions.success(res, 'pull data success');
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

// permission
exports.permission = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_permision?page=1');
        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let namePer = data[i].name_per;
            // const check_id = await HR_Cancel.findById(_id);
            // if (!check_id || check_id.length === 0) {
            let data_recruitment = new HR_Permisions({ id, namePer });
            await HR_Permisions.create(data_recruitment);
            // }
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

// policys
exports.policy = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_permision?page=1');
        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let provisionId = data[i].provision_id;
            let timeStart = data[i].time_start;
            let supervisorName = data[i].supervisor_name;
            let applyFor = data[i].apply_for;
            let content = data[i].content;
            let createdBy = data[i].created_by;
            let isDelete = data[i].is_delete;
            let createdAt = data[i].created_at;
            let name = data[i].name;
            let file = data[i].file;
            let deletedAt = data[i].deleted_at;
            // const check_id = await HR_Cancel.findById(_id);
            // if (!check_id || check_id.length === 0) {
            let data_recruitment = new HR_Policys({ id, provisionId, timeStart, supervisorName, applyFor, content, createdBy, isDelete, createdAt, name, file, deletedAt });
            await HR_Policys.create(data_recruitment);
            // }
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.provisionOfCompany = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_provisions_of_company?page=1');
        for (let i = 0; i < data.length; i++) {
            let _id = Number(data[i].id);
            let provisionId = data[i].provision_id;
            let timeStart = data[i].time_start;
            let supervisorName = data[i].supervisor_name;
            let applyFor = data[i].apply_for;
            let content = data[i].content;
            let createdBy = data[i].created_by;
            let isDelete = data[i].is_delete;
            let createdAt = data[i].created_at;
            let name = data[i].name;
            let file = data[i].file;
            let deletedAt = data[i].deleted_at;
            // const check_id = await HR_Cancel.findById(_id);
            // if (!check_id || check_id.length === 0) {
            let data_recruitment = new HR_Policys({ _id, provisionId, timeStart, supervisorName, applyFor, content, createdBy, isDelete, createdAt, name, file, deletedAt });
            await HR_Policys.create(data_recruitment);
            // }
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.avatar = async(req, res, next) => {
        try {
            let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_leader_avt');
            for (let i = 0; i < data.length; i++) {
                let check = await HR_InfoLeaders.find({ epId: data[i].ep_id })
                if (check && check.length !== 0) {
                    console.log('2')
                    await HR_InfoLeaders.findOneAndUpdate({ epId: data[i].ep_id }, { avatar: data[i].avatar })
                }
            }
            return functions.success(res, 'pull data success');
        } catch (error) {
            return functions.setError(res, error)
        }
    }
    //stageRecruitment
exports.stageRecruitment = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_stage_recruitment?page=1');
        for (let i = 0; i < data.length; i++) {
            let id = Number(data[i].id);
            let recruitmentId = data[i].recruitment_id;
            let name = data[i].name;
            let positionAssumed = data[i].position_assumed;
            let target = data[i].target;
            let complete_time = data[i].complete_time;
            let description = Buffer.from(data[i].description, 'base64');
            let isDelete = data[i].is_delete;
            // const check_id = await HR_Cancel.findById(_id);
            // if (!check_id || check_id.length === 0) {
            let data_recruitment = new HR_StageRecruitments({ id, recruitmentId, name, positionAssumed, target, complete_time, description, isDelete });
            await HR_StageRecruitments.create(data_recruitment);
            // }
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
exports.toolInfringe = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_infringes_for', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const infringe = new infringe({
                        id: data[i].id,
                        infringeName: data[i].infringe_name,
                        regulatoryBasis: data[i].regulatory_basis,
                        numberViolation: data[i].number_violation,
                        listUser: data[i].list_user,
                        listUserName: data[i].list_user_name,
                        createdBy: data[i].created_by,
                        infringeAt: data[i].infringe_at,
                        infringeType: data[i].infringe_type,
                        type: data[i].type,
                        companyId: data[i].com_id,
                        depId: data[i].dep_id,
                        depName: data[i].dep_name,
                        createdAt: new Date(data[i].created_at),
                        updatedAt: new Date(data[i].updated_at)
                    });
                    await infringe.create(infringe);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolJobDes = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_job_description?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const jobDes = new JobDes({
                        id: data[i].id,
                        name: data[i].name,
                        depName: data[i].department_name,
                        des: data[i].description,
                        jobRequire: data[i].job_require,
                        roadMap: data[i].road_map,
                        comId: data[i].com_id,
                        createdAt: data[i].created_at,
                        updatedAt: data[i].updated_at,
                        deletedAt: data[i].deleted_at,
                        isDelete: data[i].is_delete
                    });
                    await JobDes.create(jobDes);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolAnotherSkill = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_another_skill?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const anotherSkill = new AnotherSkill({
                        id: data[i].id,
                        canId: data[i].can_id,
                        skillName: data[i].skill_name,
                        skillVote: data[i].skill_vote,
                        createAt: data[i].created_at
                    });
                    await AnotherSkill.create(anotherSkill);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolPermisionDetail = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_per_detail?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const permisionDetail = new PermisionDetail({
                        id: data[i].id,
                        perId: data[i].id_per,
                        actName: data[i].action_name,
                        actCode: data[i].action_code,
                        checkAct: data[i].check_action
                    });
                    await PermisionDetail.create(permisionDetail);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolRemind = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_remind?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const remind = new Remind({
                        id: data[i].id,
                        type: data[i].type,
                        remindType: data[i].remind_type,
                        canId: data[i].can_id,
                        canName: data[i].can_name,
                        comId: data[i].com_id,
                        userId: data[i].user_id,
                        time: data[i].time,
                        createdAt: data[i].created_at
                    });
                    await Remind.create(remind);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolProcessInterview = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_process_interview?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const processInterview = new ProcessInterview({
                        id: data[i].id,
                        name: data[i].name,
                        processBefore: data[i].process_before,
                        comId: data[i].com_id,
                        createdAt: data[i].created_at
                    });
                    await ProcessInterview.create(processInterview);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolProcessTraining = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_training_process?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const processTraining = new ProcessTraining({
                        id: data[i].id,
                        name: data[i].name,
                        description: data[i].description,
                        comId: data[i].com_id,
                        isDelete: data[i].is_delete,
                        createdAt: data[i].created_at,
                        updatedAt: data[i].updated_at,
                        deletedAt: data[i].deleted_at
                    });
                    await ProcessTraining.create(processTraining);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolSignatureImage = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_signature_image?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const signatureImage = new SignatureImage({
                        id: data[i].id,
                        empId: data[i].ep_id,
                        imgName: data[i].image_name,
                        createdAt: data[i].created_at,
                        isDelete: data[i].is_delete,
                        deletedAt: data[i].deleted_at
                    });
                    await SignatureImage.create(signatureImage);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolInviteInterview = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_invite_interview?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const signatureImage = new InviteInterview({
                        id: data[i].id,
                        posApply: data[i].position_apply,
                        canId: data[i].candidate_id,
                        canEmail: data[i].candidate_email,
                        canName: data[i].candidate_name,
                        hrName: data[i].hr_name,
                        content: Buffer.from(data[i].content, 'base64'),
                        note: data[i].note,
                        noteTest: data[i].note_test,
                    });
                    await InviteInterview.create(signatureImage);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolScheduleInterview = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_tbl_schedule_interview?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const scheduleInterview = new ScheduleInterview({
                        id: Number(data[i].id),
                        canId: data[i].can_id,
                        empInterview: data[i].ep_interview,
                        processInterviewId: data[i].process_interview_id,
                        canEmail: data[i].uv_email,
                        resiredSalary: data[i].resired_salary,
                        salary: data[i].salary,
                        interviewTime: Date(data[i].interview_time),
                        content: Buffer.from(data[i].contentsend, 'base64'),
                        isSwitch: data[i].is_switch,
                        note: data[i].note,
                        empCrmId: data[i].id_ep_crm,
                        createdAt: data[i].created_at,
                    });
                    await ScheduleInterview.create(scheduleInterview);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolRecruitment = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_recruitment?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const recruitment = new Recruitment({
                        id: data[i].id,
                        name: data[i].name,
                        createdBy: data[i].created_by,
                        createdAt: data[i].created_at,
                        deletedAt: data[i].deleted_at,
                        isDelete: data[i].is_delete,
                        applyFor: data[i].apply_for,
                        slug: data[i].slug,
                        comId: data[i].com_id,
                        isCom: data[i].is_com
                    });
                    await Recruitment.create(recruitment);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.toolRecruitmentNews = async(req, res, next) => {
    try {
        console.log(".....")
        let page = 1;
        let result = true;
        do {
            const form = new FormData();
            form.append('page', page);
            const response = await axios.post(`https://phanmemnhansu.timviec365.vn/api/Nodejs/get_recruitment_news?page=${page}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const recruitmentNews = new RecruitmentNews({
                        id: data[i].id,
                        title: data[i].title,
                        posApply: data[i].position_apply,
                        cityId: data[i].cit_id,
                        address: data[i].address,
                        cateId: data[i].cate_id,
                        salaryId: data[i].salary_id,
                        number: data[i].number,
                        timeStart: Date(data[i].recruitment_time),
                        timeEnd: Date(data[i].recruitment_time_to),
                        jobDetail: data[i].job_detail,
                        wokingForm: data[i].woking_form,
                        probationaryTime: data[i].probationary_time,
                        moneyTip: data[i].money_tip,
                        jobDes: data[i].job_description,
                        interest: data[i].interest,
                        recruitmentId: data[i].recruitmen_id,
                        jobExp: data[i].job_exp,
                        degree: data[i].degree,
                        gender: data[i].gender,
                        jobRequire: data[i].job_require,
                        memberFollow: data[i].member_follow,
                        hrName: data[i].hr_name,
                        createdAt: data[i].created_at,
                        updatedAt: data[i].updated_at,
                        deletedAt: data[i].deleted_at,
                        isDelete: data[i].is_delete,
                        comId: data[i].com_id,
                        isCom: data[i].is_com,
                        createdBy: data[i].created_by,
                        isSample: data[i].is_sample
                    });
                    await RecruitmentNews.create(recruitmentNews);
                }
                page++;
            } else {
                result = false;
            }
            console.log(page);
        } while (result);

        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

// provisionCompany
exports.stageRecruitment = async(req, res, next) => {
    try {
        let data = await functions.getDataAxios('https://phanmemnhansu.timviec365.vn/api/Nodejs/get_provisions_of_company?page=1');
        for (let i = 0; i < data.length; i++) {
            let _id = Number(data[i].id);
            let description = data[i].description;
            let isDelete = data[i].is_delete;
            let name = data[i].name;
            let timeStart = data[i].time_start;
            let supervisorName = data[i].supervisor_name;
            let comId = data[i].com_id;
            let file = data[i].file;
            let createdAt = data[i].created_at;
            let deletedAt = data[i].deleted_at;
            // const check_id = await HR_Cancel.findById(_id);
            // if (!check_id || check_id.length === 0) {
            let data_recruitment = new HR_StageRecruitments({ id, recruitmentId, name, positionAssumed, target, complete_time, description, isDelete });
            await HR_StageRecruitments.create(data_recruitment);
            // }
        }
        return functions.success(res, "Thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};