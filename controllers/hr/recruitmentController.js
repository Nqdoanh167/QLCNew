const functions = require('../../services/functions');
const hrService = require('../../services/hr/hrService');
const Recruitment = require('../../models/hr/Recruitment');
const RecruitmentNews = require('../../models/hr/RecruitmentNews');
const StageRecruitment = require('../../models/hr/StageRecruitment');
const Candidate = require('../../models/hr/Candidates');
const ProcessInterview = require('../../models/hr/ProcessInterview');
const InviteInterview = require('../../models/hr/InviteInterview');
const ScheduleInterview = require('../../models/hr/ScheduleInterview');
const ContactJob = require('../../models/hr/ContactJob');
const CancelJob = require('../../models/hr/CancelJob');
const FailJob = require('../../models/hr/FailJob');
const GetJob = require('../../models/hr/GetJob');
const Remind = require('../../models/hr/Remind');
const Notify = require('../../models/hr/Notify');
const AnotherSkill = require('../../models/hr/AnotherSkill');
const Users = require('../../models/Users');

// lay ra danh sach tat ca cac quy trinh tuyen dung cua cty
exports.getListRecruitment= async(req, res, next) => {
    try {
        let {page, pageSize, name, recruitmentId} = req.body;
        if(!page || !pageSize){
            return functions.setError(res, "Missing input page or pageSize", 401);
        }
        page = Number(req.body.page);
        pageSize = Number(req.body.pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let infoLogin = req.infoLogin;
        let listCondition = {comId: infoLogin.comId, isDelete: 0};
        
        // dua dieu kien vao ob listCondition
        if(name) listCondition.name =  new RegExp(name, 'i');
        if(recruitmentId) listCondition.id = Number(recruitmentId);
        const listRecruit = await functions.pageFind(Recruitment, listCondition, { _id: 1 }, skip, limit); 
        const totalCount = await functions.findCount(Recruitment, listCondition);
        return functions.success(res, "Get list recruitment success", {totalCount: totalCount, data: listRecruit });
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.createRecruitment = async(req, res, next) => {
    try {
        
        let {nameProcess, applyFor, listStage} = req.body;
        if(!nameProcess || !applyFor || !listStage) {
            return functions.setError(res, "Missing input value!", 404);
        }
        let infoLogin = req.infoLogin;

        //tao slug
        let slug = hrService.titleToSlug(nameProcess);

        //lay id max
        const maxIdRecruit = await Recruitment.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdRecruit;
        if (maxIdRecruit) {
            newIdRecruit = Number(maxIdRecruit.id) + 1;
        } else newIdRecruit = 1;

        //tao quy trinh
        let isCom = 0;
        let createBy = infoLogin.name;
        if(infoLogin.type==1) {
            isCom=1;
            createBy = 'Công ty';
        }
        let recruitment = new Recruitment({
            id: newIdRecruit,
            name: nameProcess,
            createdBy: createBy,
            createdAt: Date.now(),
            applyFor: applyFor,
            slug: slug,
            comId: infoLogin.comId,
            isCom: isCom
        });
        recruitment = await recruitment.save();
        if(!recruitment) {
            return functions.setError(res, "Create recruitment fail!", 504);
        }

        //tao cac giai doan cua quy trinh do
        for(let i=0; i<listStage.length; i++){
            if(!listStage[i].nameStage || !listStage[i].posAssum || !listStage[i].target) {
                return functions.setError(res, "Missing input value!", 405);
            }
            //lay id max
            const maxIdStageRecruit = await StageRecruitment.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
            let newIdStageRecruit;
            if (maxIdStageRecruit) {
                newIdStageRecruit = Number(maxIdStageRecruit.id) + 1;
            } else newIdStageRecruit = 1;
            let stageRecruit = new StageRecruitment({
                id: newIdStageRecruit,
                recruitmentId: recruitment.id,
                name: listStage[i].nameStage,
                positionAssumed: listStage[i].posAssum,
                target: listStage[i].target,
                completeTime: listStage[i].time,
                description: Buffer.from(listStage[i].des, 'base64')
            });
            let stageRecruitment = await StageRecruitment.create(stageRecruit);
            if(!stageRecruitment) {
            return functions.setError(res, `Create stage recruitment ${i+1} fail!`, 505);
        }
        }
        
        return functions.success(res, 'Create recruitment success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateRecruitment = async(req, res, next) => {
    try{
        let {recruitId, nameProcess, applyFor} = req.body;
        if(!recruitId || !nameProcess || !applyFor) {
            return functions.setError(res, "Missing input vlaue!", 404);
        }
        const recruit = await Recruitment.findOneAndUpdate({id: recruitId}, {
            name: nameProcess,
            applyFor: applyFor
        })
        if(!recruit) {
            return functions.setError(res, "Recruitment not found!", 505);
        }
        return functions.success(res, "update recruitment success!");
    }catch(err){
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.softDeleteRecruitment = async(req, res, next) => {
    try {
        let recruitmentId = req.body.recruitmentId;
        let recruitment = await Recruitment.findOneAndUpdate({id: recruitmentId}, {
            deletedAt: Date.now(),
            isDelete: 1
        })
        if(!recruitment) {
            return functions.setError(res, "News not found!", 505);
        }
        return functions.success(res, "Soft delete stage recruitment success!");
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}

exports.deleteRecruitment = async(req, res, next) => {
    try {
        let recruitId = Number(req.query.recruitId);
        if(!recruitId){
            return functions.success(res, "Missing input value id", 404);
        }
        let recruitment = await functions.getDataDeleteOne(Recruitment ,{id: recruitId});
        if (recruitment.deletedCount===1) {
            return functions.success(res, `Delete recruitment with _id=${recruitId} success`);
        }
        return functions.success(res, "Recruitment not found");
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}

//----------------------------giai doan trong quy trinh tuyen dung

//lay ra thong tin cac gia doan cua quy trinh or thong tin 1 quy trinh
exports.getStageRecruitment = async(req, res, next) => {
    try{
        let stageRecruitId = req.body.stageRecruitId;
        let recruitmentId = req.body.recruitmentId;
        var data = {};
        if(stageRecruitId){
            data = await StageRecruitment.findOne({id: stageRecruitId});
            if(!data) {
                return functions.setError(res, "Stage recruitment not found!", 503);
            }
        }else if(recruitmentId){
            let recruitment = await Recruitment.findOne({id: recruitmentId});
            if(!recruitment){
                return functions.setError(res, "Recruitment not found!", 504);
            }
            
            data.recruitment = recruitment.name;
            let listStage = await StageRecruitment.find({recruitmentId: recruitmentId, isDelete: 0});
            data.listStage = listStage;
        }
        else {
            return functions.setError(res, "Missing input value!", 404);
        }
        return functions.success(res, "get stage recruitment success!", {data: data});
    }catch(e){
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}
//them moi giai doan
exports.createStageRecruitment = async(req, res, next) => {
    try {
        let {recruitmentId ,nameStage, posAssum, target, time, des} = req.body;
        if(!recruitmentId || !nameStage || !posAssum || !target) {
            return functions.setError(res, "Missing input value!", 404);
        }
        //lay id max
        const maxIdStageRecruit = await StageRecruitment.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdStageRecruit;
        if (maxIdStageRecruit) {
            newIdStageRecruit = Number(maxIdStageRecruit.id) + 1;
        } else newIdStageRecruit = 1;
        
        //tao cac giai doan cua quy trinh do
        let stageRecruit = new StageRecruitment({
            id: newIdStageRecruit,
            recruitmentId: recruitmentId,
            name: nameStage,
            positionAssumed: posAssum,
            target: target,
            completeTime: time,
            description: Buffer.from(des, 'base64')
        });
        await StageRecruitment.create(stageRecruit);
        return functions.success(res, 'Create stage recruitment success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateStageRecruitment = async(req, res, next) => {
    try {
        let {stageRecruitmentId ,nameStage, posAssum, target, time, des} = req.body;
        if(!stageRecruitmentId || !nameStage || !posAssum || !target) {
            return functions.setError(res, "Missing input value!", 404);
        }
        //
        const stageRecruit = await StageRecruitment.findOneAndUpdate({id: stageRecruitmentId}, {
            name: nameStage,
            positionAssumed: posAssum,
            posAssum: posAssum,
            target: target,
            completeTime: time,
            description: des
        })
        if(!stageRecruit) {
            return functions.setError(res, "Stage recruitment not found!", 505);
        }
        return functions.success(res, "update state recruitment success!");
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.softDeleteStageRecruitment = async(req, res, next) => {
    try {
        let stageRecruitmentId = req.body.stageRecruitmentId;
        let recruitment = await StageRecruitment.findOneAndUpdate({id: stageRecruitmentId}, {
            deletedAt: Date.now(),
            isDelete: 1
        })
        if(!recruitment) {
            return functions.setError(res, "News not found!", 505);
        }
        return functions.success(res, "Soft delete recruitment success!");
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}


//------------------------------controller recruitment new----------------------

exports.getListRecruitmentNews= async(req, res, next) => {
    try {
        let {page, pageSize, title, fromDate, toDate} = req.body;

        //id company lay ra sau khi dang nhap
        let comId = req.infoLogin.comId;
        if(!page || !pageSize){
            return functions.setError(res, "Missing input page or pagesize", 401);
        }
        
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let listCondition = {isDelete: 0, comId: comId};
        // dua dieu kien vao ob listCondition
        if(title) listCondition.title =  new RegExp(title, 'i');
        if(fromDate) listCondition.timeStart = {$gte: new Date(fromDate)};
        if(toDate) listCondition.timeEnd = {$lte: new Date(toDate)};
        let fields = {id: 1, title: 1, number: 1,timeStart: 1, timeEnd: 1, createdBy: 1, hrName: 1, address: 1, recruitmentId: 1};
        var listRecruitmentNews = await functions.pageFindWithFields(RecruitmentNews, listCondition, fields,{ _id: 1 }, skip, limit);
        for(let i=0; i<listRecruitmentNews.length; i++){
            let condtion = {recruitmentNewsId: listRecruitmentNews[i].id, isDelete: 0};
            let numberCandi = await Candidate.countDocuments({recruitmentNewsId: listRecruitmentNews[i].id});
            let totalCandidate = await Candidate.find({recruitmentNewsId: listRecruitmentNews[i].id, isDelete: 0}).lean().count();
            let totalCandidateGetJob = await Candidate.aggregate([
                {$match: {comId: comId, isDelete: 0}},
                {
                    $lookup: {
                        from: "HR_GetJobs",
                        localField: "id",
                        foreignField: "canId",
                        as: "getJob"
                    }
                },
                {
                    $count: "totalDocuments"
                }
            ]);

            let totalCandidateFailJob = await Candidate.aggregate([
                {$match: {comId: comId, isDelete: 0}},
                {
                    $lookup: {
                        from: "HR_FailJobs",
                        localField: "id",
                        foreignField: "canId",
                        as: "failJob"
                    }
                },
                {
                    $count: "totalDocuments"
                }
            ]);

            let totalCandidateInterview = await Candidate.aggregate([
                {$match: {comId: comId, isDelete: 0}},
                {
                    $lookup: {
                        from: "HR_ScheduleInterviews",
                        localField: "id",
                        foreignField: "canId",
                        as: "interviewJob"
                    }
                },
                {
                    $count: "totalDocuments"
                }
            ]);
            
            listRecruitmentNews[i].totalCandidateGetJob = totalCandidateGetJob[0].totalDocuments;
            listRecruitmentNews[i].totalCandidateFailJob = totalCandidateFailJob[0].totalDocuments;
            listRecruitmentNews[i].totalCandidateInterview = totalCandidateInterview[0].totalDocuments;
            let hr = await Users.findOne({idQLC: listRecruitmentNews[i].hrName});
            if(hr) {
                listRecruitmentNews[i].hrName = hr.userName;
            }
        }
        const totalCount = await functions.findCount(RecruitmentNews, listCondition);
        return functions.success(res, "Get list recruitment news success", {totalCount: totalCount, data: listRecruitmentNews });
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.getTotalCandidateFollowDayMonth = async(req, res, next) => {
    try {
        // Get Today Start Date and End Date
        // let startOfDay = new Date();
        // startOfDay.setHours(0, 0, 0, 0);
        // let endOfDay = new Date();
        // endOfDay.setHours(23, 59, 59, 999);
        // console.log(startOfDay, endOfDay);

        let comId = req.infoLogin.comId;
        // Số lượng tài liệu theo ngày hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        let totalCandidateDay = await Candidate.countDocuments({comId: comId, isDelete: 0, timeSendCv: {$gte: today, $lt: tomorrow}});


        // Số lượng tài liệu theo tuần này
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        let totalCandidateWeek = await Candidate.countDocuments({comId: comId, isDelete: 0, timeSendCv: {$gte: startOfWeek, $lt: endOfWeek}});


        // Số lượng tài liệu theo tháng này
        const startOfMonth = new Date();
        startOfMonth.setHours(0, 0, 0, 0);
        startOfMonth.setDate(1);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        let totalCandidateMonth = await Candidate.countDocuments({comId: comId, isDelete: 0, timeSendCv: {$gte: startOfMonth, $lt: endOfMonth}});
        
        return functions.success(res, "Get list candidate success",{totalCandidateDay, totalCandidateWeek, totalCandidateMonth} );
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.getDetailRecruitmentNews= async(req, res, next) => {
    try {
        let {recruitmentNewsId} = req.body;
        if(!recruitmentNewsId){
            return functions.setError(res, "Missing input recruitmentNewsId!", 405);
        }

        //id company lay ra sau khi dang nhap
        let comId = req.infoLogin.comId;
        
        let condition = {isDelete: 0, comId: comId, id: recruitmentNewsId};
        
        var recruitmentNews = await RecruitmentNews.findOne(condition, {title: 1, number: 1,timeStart: 1, timeEnd: 1, createdBy: 1, hrName: 1}).lean();
        let hr = await Users.findOne({idQLC: recruitmentNews.hrName});
        if(hr){
            recruitmentNews.hrName = hr.userName;
        }

        let listCandidate = await Candidate.find({recruitmentNewsId: recruitmentNewsId, isDelete: 0}, {name: 1, phone:1, email: 1});

        let listCandidateGetJob = await Candidate.aggregate([
            {$match: {comId: comId, isDelete: 0}},
            {
                $lookup: {
                    from: "HR_GetJobs",
                    localField: "id",
                    foreignField: "canId",
                    as: "getJob"
                }
            },
            {$project: {name: 1, phone:1, email: 1}}
        ]);

        let listCandidateFailJob = await Candidate.aggregate([
            {$match: {comId: comId, isDelete: 0}},
            {
                $lookup: {
                    from: "HR_FailJobs",
                    localField: "id",
                    foreignField: "canId",
                    as: "failJob"
                }
            },
            {$project: {name: 1, phone:1, email: 1}}
        ])

        let listCandidateContactJob = await Candidate.aggregate([
            {$match: {comId: comId, isDelete: 0}},
            {
                $lookup: {
                    from: "HR_ContactJobs",
                    localField: "id",
                    foreignField: "canId",
                    as: "contactJob"
                }
            },
            {$project: {name: 1, phone:1, email: 1}}
        ])

        let listCandidateInterview = await Candidate.aggregate([
            {$match: {comId: comId, isDelete: 0}},
            {
                $lookup: {
                    from: "HR_ScheduleInterviews",
                    localField: "id",
                    foreignField: "canId",
                    as: "InterviewJob"
                }
            },
            {$project: {name: 1, phone:1, email: 1}}
        ])
        return functions.success(res, "Get list recruitment news success", {recruitmentNews, listCandidate, listCandidateGetJob,listCandidateFailJob,listCandidateContactJob, listCandidateInterview });
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}




exports.checkDataRecruitmentNews = async(req, res, next) => {
    try {
        let {
                title,posApply,cityId,address,cateId,salaryId,number,timeStart,timeEnd,jobDetail,wokingForm,probationaryTime,moneyTip,
                jobDes,interest,recruitmentId,jobExp,degree,gender,jobRequire,memberFollow,hrName,comId,isCom,createdBy
            } = req.body;
        let fields = [
                title,posApply,cityId,cateId,salaryId,number,timeStart,timeEnd,jobDetail,wokingForm,
                jobDes,interest,recruitmentId,jobExp,degree,gender,jobRequire,memberFollow,hrName
            ]
        for(let i=0; i<fields.length; i++){
            if(!fields[i])
                return functions.setError(res, `Missing input value ${i+1}`, 404);
        }
        // them cac truong muon them hoac sua
        req.info = {
            title: title,
            posApply: posApply,
            cityId: cityId,
            address: address,
            cateId: cateId,
            salaryId: salaryId,
            number: number,
            timeStart: timeStart,
            timeEnd: timeEnd,
            jobDetail: jobDetail,
            wokingForm: wokingForm,
            probationaryTime: probationaryTime,
            moneyTip: moneyTip,
            jobDes: jobDes,
            interest: interest,
            recruitmentId: recruitmentId,
            jobExp: jobExp,
            degree: degree,
            gender: gender,
            jobRequire: jobRequire,
            memberFollow: memberFollow,
            hrName: hrName
        }
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createRecruitmentNews = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let fields = req.info;
        let infoLogin = req.infoLogin;
        //them cac truong an
        fields.createdAt = Date.now();
        fields.comId = infoLogin.comId;
        fields.createdBy = infoLogin.name;
        fields.isCom = 0;
        if(infoLogin.type==1){
            fields.createdBy = 'Công ty';
            fields.isCom = 1;
        }

        //lay id max
        const maxIdNews = await RecruitmentNews.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdNews;
        if (maxIdNews) {
            newIdNews = Number(maxIdNews.id) + 1;
        } else newIdNews = 1;
        fields.id = newIdNews;

        //tao 
        let recruitmentNews = new RecruitmentNews(fields);
        await recruitmentNews.save();
        return functions.success(res, 'Create recruitmentNews success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateRecruitmentNews = async(req, res, next) => {
    try{
        let recruitmentNewsId = req.body.recruitmentNewsId;
        if(!recruitmentNewsId)
            return functions.setError(res, "Missing input id news!", 404);
        let fields = req.info;
        fields.updatedAt = Date.now();
        let recruitmentNews = await RecruitmentNews.findOneAndUpdate({id: recruitmentNewsId}, fields);
        if(!recruitmentNews) {
            return functions.setError(res, "Recruitment News not found!", 505);
        }
        return functions.success(res, "Update news success!");
    }catch(err){
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.softDeleteRecuitmentNews = async(req, res, next) =>{
    try{
        let newsId = req.body.newsId;
        let recruitmentNews = await RecruitmentNews.findOneAndUpdate({id: newsId}, {
            deletedAt: Date.now(),
            isDelete: 1
        })
        if(!recruitmentNews) {
            return functions.setError(res, "News not found!", 505);
        }
        return functions.success(res, "Soft delete news success!");
    }catch(err){
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createSampleNews = async(req, res, next) =>{
    try{
        let newsId = req.body.newsId;
        let recruitmentNews = await RecruitmentNews.findOneAndUpdate({id: newsId}, {
            isSample: 1
        })
        if(!recruitmentNews) {
            return functions.setError(res, "News not found!", 505);
        }
        return functions.success(res, "Create sample news success!");
    }catch(err){
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

//---------------------------------ung vien


exports.getListCandidate= async(req, res, next) => {
    try {
        let {page, pageSize, fromDate, toDate, name, recruitmentNewsId, userHiring, gender, status} = req.body;

        //id company lay ra sau khi dang nhap
        let comId = req.infoLogin.comId;
        if(!page || !pageSize){
            return functions.setError(res, "Missing input page or pagesize", 401);
        }
        
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let listCondition = {isDelete: 0, comId: comId};
        // dua dieu kien vao ob listCondition
        if(name) listCondition.name =  new RegExp(name, 'i');
        if(recruitmentNewsId) listCondition.recruitmentNewsId =  Number(recruitmentNewsId);
        if(userHiring) listCondition.userHiring =  Number(userHiring);
        if(gender) listCondition.gender =  Number(gender);
        if(status) listCondition.status =  Number(status);
        if(fromDate) listCondition.timeSendCv = {$gte: new Date(fromDate)};
        if(toDate) listCondition.timeSendCv = {$lte: new Date(toDate)};

        const listCandidate = await functions.pageFind(Candidate, listCondition, { _id: 1 }, skip, limit);
        const totalCount = await functions.findCount(Candidate, listCondition);
        return functions.success(res, "Get list candidate success", {totalCount: totalCount, data: listCandidate });
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.checkDataCandidate = async(req, res, next) => {
    try {
        let {
                name, email, phone, cvFrom, userRecommend, recruitmentNewsId, timeSendCv,  interviewTime, interviewResult, interviewVote, salaryAgree, status, cv, 
                createdAt, updatedAt, isDelete, comId, isOfferJob, gender, birthday, education, exp, isMarried, address, userHiring, starVote, school, hometown, isSwitch, epIdCrm,firstStarVote,listSkill,
            } = req.body;
        let fields = [
                name, email, phone, cvFrom, userRecommend, recruitmentNewsId,
                timeSendCv, gender, birthday, education, exp, isMarried, address, userHiring, firstStarVote, hometown
                ];
        // for(let i=0; i<fields.length; i++){
        //     if(!fields[i])
        //         return functions.setError(res, `Missing input value ${i+1}`, 404);
        // }
        // them cac truong muon them hoac sua
        req.info = {
            name: name,
            email: email,
            phone: phone,
            gender: gender,
            birthday: birthday,
            hometown: hometown,
            education: education,
            school: school,
            exp: exp,
            isMarried: isMarried,
            address: address,
            cvFrom: cvFrom,
            userHiring: userHiring,         
            userRecommend: userRecommend,
            recruitmentNewsId: recruitmentNewsId,
            timeSendCv: Date(timeSendCv),
            starVote: firstStarVote,
        }
        
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createCandidate = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let fields = req.info;
        let infoLogin = req.infoLogin;
        //them cac truong an
        fields.comId = infoLogin.comId;

        //lay id max
        const maxIdCandi = await Candidate.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdCandi;
        if (maxIdCandi) {
            newIdCandi = Number(maxIdCandi.id) + 1;
        } else newIdCandi = 1;
        fields.id = newIdCandi;

        // luu cv
        let cv = req.files.cv;
        if(cv && await hrService.checkFile(cv.path)){
            let nameCv = await hrService.uploadFileCv(newIdCandi,cv);
            fields.cv = nameCv;
        }

        // tao
        let candidate = new Candidate(fields);
        await candidate.save();
        if(!candidate){
            return functions.setError(res, "Create candidate fail!", 506);
        }

        //them ky nang moi
        let listSkill = req.body.listSkill;
        if(listSkill){
            for(let i=0; i<listSkill.length; i++){
                const obj = JSON.parse(listSkill[i]);
                let dataSkill = {
                    canId: newIdCandi,
                    skillName: obj.skillName,
                    skillVote: obj.skillVote
                }
                const maxIdSkill = await AnotherSkill.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
                let newIdSkill;
                if (maxIdSkill) {
                    newIdSkill = Number(maxIdSkill.id) + 1;
                } else newIdSkill = 1;
                dataSkill.id = newIdSkill;
                let skill = new AnotherSkill(dataSkill);
                await skill.save();
                if(!skill){
                    return functions.setError(res, "Create skill fail!", 506);
                }
            }
        }
        

        //them thong baos
        let dataNotify = null;
        if(infoLogin.type==1){
            if(candidate.userHiring) {
                dataNotify = {
                    canId: newIdCandi,
                    type: 2,
                    comNotify: 1,
                    comId: infoLogin.comId,
                    userId: candidate.userHiring,
                }
            }
        }else {
            dataNotify = {
                canId: newIdCandi,
                type: 1,
                comNotify: 0,
                comId: infoLogin.comId,
                userId: infoLogin.id,
            }
        }
        if(dataNotify!=null){
            const maxIdNotify = await Notify.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
            let newIdNotify;
            if (maxIdNotify) {
                newIdNotify = Number(maxIdNotify.id) + 1;
            } else newIdNotify = 1;
            dataNotify.id = newIdNotify;
            let notify = new Notify(dataNotify);
            await notify.save();
            if(!notify){
                return functions.setError(res, "Create notify fail!", 506);
            }
        }
        return functions.success(res, 'Create candidate success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}


exports.updateCandidate = async(req, res, next) => {
    try{
        let candidateId = req.body.candidateId;
        if(!candidateId)
            return functions.setError(res, "Missing input id candidate!", 404);
        let fields = req.info;
        fields.updatedAt = Date.now();
        let cv = req.files.cv;
        if(cv && await hrService.checkFile(cv.path)){
            let nameCv = await hrService.uploadFileCv(candidateId,cv);
            // await hrService.deleteFileCv(candidateId);
            fields.cv = nameCv;
        }
        //
        let candi = await Candidate.findOneAndUpdate({id: candidateId}, fields, {new: true});
        if(!candi) {
            return functions.setError(res, "Candidate not found!", 505);
        }

        //them ky nang moi
        await AnotherSkill.deleteMany({canId: candidateId});

        let listSkill = req.body.listSkill;
        if(listSkill) {
            for(let i=0; i<listSkill.length; i++){
                const obj = JSON.parse(listSkill[i]);
                let dataSkill = {
                    canId: candidateId,
                    skillName: obj.skillName,
                    skillVote: obj.skillVote
                }
                const maxIdSkill = await AnotherSkill.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
                let newIdSkill;
                if (maxIdSkill) {
                    newIdSkill = Number(maxIdSkill.id) + 1;
                } else newIdSkill = 1;
                dataSkill.id = newIdSkill;
                let skill = new AnotherSkill(dataSkill);
                await skill.save();
                if(!skill){
                    return functions.setError(res, `Create skill ${i+1} fail!`, 506);
                }
            }
        }
        
        return functions.success(res, "Update info candidate success!");
    }catch(err){
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.softDeleteCandidate = async(req, res, next) =>{
    try{
        let candidateId = req.body.candidateId;
        if(!candidateId) {
            return functions.setError(res, "Missing input id", 404);
        }
        let candi = await Candidate.findOneAndUpdate({id: candidateId}, {
            deletedAt: Date.now(),
            isDelete: 1
        })
        if(!candi) {
            return functions.setError(res, "Candidate not found!", 505);
        }
        return functions.success(res, "Soft delete candidate success!");
    }catch(err){
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

//------------them cac giai doan tuyen dung 

let getCandidateProcess = async(model, condition)=> {
    return listCandidate = await model.aggregate([
        {
            $lookup: {
                from: "HR_Candidates",
                localField: "canId",
                foreignField: "id",
                as: "candidate"
            }
        },
        
        {
            $unwind: "$candidate"
        },
        {
            $replaceRoot: {
                newRoot: { $mergeObjects: ["$$ROOT", "$candidate"]}   
            }
        },
        {$match: condition},
        
        // {
        //     $project: {name: 1, phone: 1, recruitmentNewsId: 1, userHiring: 1, }
        // },
        {
            $lookup: {
                from: "HR_RecruitmentNews",
                localField: "recruitmentNewsId",
                foreignField: "id",
                as: "recruitmentNews"
            }
        },
        {
            $unwind: "$recruitmentNews"
        },
        {
            $lookup: {
                from: "Users",
                localField: "userHiring",
                foreignField: "_id",
                as: "userHiring"
            }
        },
        {
            $unwind: "$userHiring"
        },
        
        {$project: {id: 1, name: 1, phone: 1, email: 1, gender: 1, hometown: 1, birthday: 1, education: 1, school: 1, exp: 1, isMarried: 1, address: 1, cvFrom: 1, timeSendCv: 1, "userHiring.userName": 1, "recruitmentNews.title": 1}},
        // {$sort: {id: 1}},
        // {$skip: skip},
        // {$limit: limit}
        ]);
}

//lay ra danh sach
//truyen canId de lay thong tin chi tiet ve ung vien
exports.getListProcessInterview= async(req, res, next) => {
    try {
        let comId = req.infoLogin.comId;
        let {fromDate, toDate, name, recruitmentNewsId, userHiring, gender, status, canId} = req.body;
        let condition = {"candidate.comId": comId};
        if(fromDate) condition["candidate.timeSendCv"]= {$gte: new Date(fromDate)};
        if(toDate) condition["candidate.timeSendCv"] = {$lte: new Date(toDate)};
        if(name) condition["candidate.name"] = new RegExp(name, 'i');
        if(recruitmentNewsId) condition["candidate.recruitmentNewsId"] = Number(recruitmentNewsId);
        if(userHiring) condition["candidate.userHiring"] = Number(userHiring);
        if(gender) condition["candidate.gender"] = Number(gender);
        if(status) condition["candidate.status"] = Number(status);

        //truyen canId de lay thong tin chi tiet ve ung vien
        if(canId) condition["candidate.id"] = Number(canId);
        // console.log(condition);

        // let listProcess = await ProcessInterview.find({comId: comId});

        //danh sach ung vien nhan viec
        let listProcess = await ProcessInterview.aggregate([
        {$match: {"comId": comId}},
        {
            $lookup: {
                from: "HR_ScheduleInterviews",
                localField: "id",
                foreignField: "processInterviewId",
                as: "ScheduleInterviews"
            }
        },
        
        {
            $unwind: "$ScheduleInterviews"
        },
        {
            $replaceRoot: {
                newRoot: { $mergeObjects: ["$$ROOT", "$ScheduleInterviews"]}   
            }
        },
        
        {
            $project: {name: 1, processBefore: 1, "ScheduleInterviews.canId": 1}
        },
        //
        {
            $lookup: {
                from: "HR_Candidates",
                localField: "ScheduleInterviews.canId",
                foreignField: "id",
                as: "candidate"
            }
        },
        
        {
            $unwind: "$candidate"
        },

        {$match: condition},
        
        {
            $project: {name: 1, processBefore: 1, "ScheduleInterviews.canId": 1, "candidate.name": 1, "candidate.recruitmentNewsId": 1, "candidate.userHiring": 1}
        },
        {
            $lookup: {
                from: "HR_RecruitmentNews",
                localField: "candidate.recruitmentNewsId",
                foreignField: "id",
                as: "recruitmentNews"
            }
        },
        {
            $unwind: "$recruitmentNews"
        },
        {
            $project: {name: 1, processBefore: 1, "ScheduleInterviews.canId": 1, 
            "candidate.name": 1, "candidate.recruitmentNewsId": 1, "candidate.userHiring": 1,
            "recruitmentNews.title": 1
            }
        },
        {
            $lookup: {
                from: "Users",
                localField: "candidate.userHiring",
                foreignField: "_id",
                as: "userHiring"
            }
        },
        {
            $unwind: "$userHiring"
        },
        {
            $project: {name: 1, processBefore: 1, "ScheduleInterviews.canId": 1, 
            "candidate.name": 1, "candidate.recruitmentNewsId": 1, "candidate.userHiring": 1, "candidate.id": 1,
            "recruitmentNews.title": 1,
            "userHiring.userName": 1
            }
        },
        
        // {$project: {name: 1, phone: 1, "userHiring.userName": 1, "recruitmentNews.title": 1}},
        // {$sort: {id: 1}},
        // {$skip: skip},
        // {$limit: limit}
        ]);
        let listCandidateGetJob = await getCandidateProcess(GetJob, condition);
        let listCandidateCancelJob = await getCandidateProcess(CancelJob, condition);
        let listCandidateFailJob = await getCandidateProcess(FailJob, condition);
        let listCandidateContactJob = await getCandidateProcess(ContactJob, condition);

        return functions.success(res, "Get list process interview success", {listProcess, listCandidateGetJob, listCandidateCancelJob, listCandidateFailJob, listCandidateContactJob});
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

//get and check data for add, edit
exports.checkDataProcess = async(req, res, next) => {
    try {
        let {name, processBefore} = req.body;
        if(!name || !processBefore){
            return functions.setError(res, `Missing input value`, 404);
        }
        
        //lay ra giai doan dung dang truoc
        if(processBefore!=1 && processBefore!=2 && processBefore!=3 && processBefore!=4){
            let process = await ProcessInterview.findOne({id: processBefore});
            if(process && process.processBefore!=0){
                processBefore = process.processBefore;
            }
        }
        // them cac truong muon them hoac sua
        req.info = {
            name: name,
            processBefore: processBefore
        }
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createProcessInterview = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let fields = req.info;

        //them cac truong an
        fields.comId = req.infoLogin.comId;

        //lay id max
        const maxIdProcessInter = await ProcessInterview.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdProcessInter;
        if (maxIdProcessInter) {
            newIdProcessInter = Number(maxIdProcessInter.id) + 1;
        } else newIdProcessInter = 1;
        fields.id = newIdProcessInter;
        
        //tao 
        let processInterview = new ProcessInterview(fields);
        processInterview =  await processInterview.save();
        return functions.success(res, 'Create process interview success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateProcessInterview = async(req, res, next) => {
    try{
        let processInterviewId = req.body.processInterviewId;
        if(!processInterviewId)
            return functions.setError(res, "Missing input id processInterview!", 404);
        let fields = req.info;

        let processInter = await ProcessInterview.findOneAndUpdate({id: processInterviewId}, fields);
        if(!processInter) {
            return functions.setError(res, "Process Interview not found!", 505);
        }
        return functions.success(res, "Update info Process Interview success!");
    }catch(err){
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.deleteProcessInterview = async(req, res, next) => {
    try {
        let processInterId = req.body.processInterId;
        if(!processInterId){
            return functions.success(res, "Missing input value id", 404);
        }
        processInterId = Number(processInterId);
        let processInter = await functions.getDataDeleteOne(ProcessInterview ,{id: processInterId});
        if (processInter.deletedCount===1) {
            return functions.success(res, `Delete process interview with _id=${processInterId} success`);
        }
        return functions.success(res, "Process Interview not found");
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}

//------------------------chuyen trang thai ho so ung vien

//kiem tra du lieu

let updateInfoCandidate = async(canId,data)=>{
    try{
        let can = await Candidate.findOneAndUpdate({id: canId}, data);
        return can;
    }catch(e){
        console.log(e);
    }
}

exports.checkDataJob = async(req, res, next) => {
    try {
        let {canId, resiredSalary, salary, offerTime, epOffer, note, type, email, contentsend, empInterview, interviewTime} = req.body;
        if(!canId){
            return functions.setError(res, `Missing input value`, 404);
        }
        // them cac truong muon them hoac sua
        req.info = {
            canId: canId,
            resiredSalary: resiredSalary,
            salary: salary,
            offerTime: offerTime,
            epOffer: epOffer,
            note: note,
            type: type,
            email: email,
            contentsend: contentsend,
            interviewTime: interviewTime,
            empInterview: empInterview,
        }
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

// ky hop dong
exports.createContactJob = async(req, res, next) => {
    try {
        let {canId, resiredSalary, salary, offerTime, epOffer, note} = req.body;
        if(!canId || !resiredSalary || !salary || !offerTime || !epOffer) {
            return functions.setError(res, `Missing input value`, 404);
        }
        canId = Number(canId);
        //lay id max
        const maxIdContacJob = await ContactJob.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdContacJob;
        if (maxIdContacJob) {
            newIdContacJob = Number(maxIdContacJob.id) + 1;
        } else newIdContacJob = 1;

        let infoContactJob = {id: newIdContacJob, canId, resiredSalary, salary, offerTime, epOffer, note};
        //tao 
        let contactJob = await ContactJob.findOneAndUpdate({canId: canId}, infoContactJob, {upsert: true, new: true});
        if(!contactJob){
            return functions.setError(res, "Create contactJob fail!", 505);
        }

        //cap nhat thong tin ung vien
        let {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote} = req.body;
        if(!name || !cvFrom || !userHiring || !recruitmentNewsId || !timeSendCv || !starVote) {
            return functions.setError(res, `Missing input value`, 405);
        }

        let infoCan = {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote, isSwitch: 1, status: 4};
        let can = await updateInfoCandidate(canId, infoCan);
        if(!can){
            functions.setError(res, `Update info candidate fail`, 506); 
        }

        //  Cập nhật giai đoạn
        await ScheduleInterview.findOneAndUpdate({canId: canId}, {isSwitch: 1});

        //xoa thang thai ung vien sau khi cap nhat
        await GetJob.deleteOne({canId: canId});
        await FailJob.deleteOne({canId: canId});
        await CancelJob.deleteOne({canId: canId});
        await ScheduleInterview.deleteOne({canId: canId});


        return functions.success(res, 'Create contactJob success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createCancelJob = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let {canId, resiredSalary, salary, note, status} = req.body;
        if(!canId || !status) {
            return functions.setError(res, `Missing input value`, 405);
        }
        //lay id max
        const maxIdCancelJob = await CancelJob.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdCancelJob;
        if (maxIdCancelJob) {
            newIdCancelJob = Number(maxIdCancelJob.id) + 1;
        } else newIdCancelJob = 1;

        let infoCancelJob = {id:newIdCancelJob,  canId, resiredSalary, salary, note, status};
        
        //tao 
        let cancelJob = await CancelJob.findOneAndUpdate({canId: canId}, infoCancelJob, {upsert: true, new: true});
        if(!cancelJob){
            return functions.setError(res, "Create cancelJob fail!", 505);
        }

        //cap nhat thong tin ung vien
        let {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote} = req.body;
        if(!name || !cvFrom || !userHiring || !recruitmentNewsId || !timeSendCv || !starVote) {
            return functions.setError(res, `Missing input value`, 405);
        }

        let infoCan = {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote, isSwitch: 1, status: 3};
        let can = await updateInfoCandidate(canId, infoCan);
        if(!can){
            functions.setError(res, `Update info candidate fail`, 506); 
        }

        //  Cập nhật giai đoạn
        await ScheduleInterview.findOneAndUpdate({canId: canId}, {isSwitch: 1});

        //xoa thang thai ung vien sau khi cap nhat
        await GetJob.deleteOne({canId: canId});
        await FailJob.deleteOne({canId: canId});
        await ContactJob.deleteOne({canId: canId});
        await ScheduleInterview.deleteOne({canId: canId});

        return functions.success(res, 'Create cancelJob success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createFailJob = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let {canId, note, type, email, contentsend} = req.body;
        if(!canId || !type || !contentsend || !email) {
            return functions.setError(res, `Missing input value`, 405);
        }
        canId = Number(canId);

        let infoFailJob = {canId, type, email, note};
        const maxIdFailJob = await FailJob.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdFailJob;
        if (maxIdFailJob) {
            newIdFailJob = Number(maxIdFailJob.id) + 1;
        } else newIdFailJob = 1;
        infoFailJob.id = newIdFailJob;
        infoFailJob.contentsend = Buffer.from(contentsend, 'base64');
        
        let failJob = await FailJob.findOneAndUpdate({canId: canId}, infoFailJob, {upsert: true, new: true});
        if(!failJob){
            return functions.setError(res, "Create failJob fail!", 505);
        }
        //gui email
        await hrService.sendEmailtoCandidate(email, '[hr.timviec365.vn] Thư Trả lời kết quả phỏng vấn', infoFailJob.contentsend);

        //cap nhat thong tin ung vien
        let {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote} = req.body;
        if(!name || !cvFrom || !userHiring || !recruitmentNewsId || !timeSendCv || !starVote) {
            return functions.setError(res, `Missing input value`, 405);
        }

        //cap nhat thong tin ung vien
        let infoCan = {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote, isSwitch: 1, status: 2};
        let can = await updateInfoCandidate(canId, infoCan);
        if(!can){
            functions.setError(res, `Update info candidate fail`, 506); 
        }

         //xoa thang thai ung vien sau khi cap nhat
        await GetJob.deleteOne({canId: canId});
        await CancelJob.deleteOne({canId: canId});
        await ContactJob.deleteOne({canId: canId});
        await ScheduleInterview.deleteOne({canId: canId});

        //  Cập nhật giai đoạn
        await ScheduleInterview.findOneAndUpdate({canId: canId}, {isSwitch: 1});

        return functions.success(res, 'Create failJob success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.addCandidateProcessInterview = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let {canId, resiredSalary, salary, note, email, contentsend, empInterview, interviewTime, processInterviewId} = req.body;
        if(!canId || !interviewTime || !empInterview || !contentsend || !email || !processInterviewId) {
            return functions.setError(res, `Missing input value`, 405);
            
        }
        canId = Number(canId);
        //lay id max
        const maxIdScheduleInterview = await ScheduleInterview.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdScheduleInterview;
        if (maxIdScheduleInterview) {
            newIdScheduleInterview = Number(maxIdScheduleInterview.id) + 1;
        } else newIdScheduleInterview = 1;

        let infoInterview = {
            id:newIdScheduleInterview, 
            canId, 
            resiredSalary, 
            salary, 
            note, 
            canEmail: email,
            processInterviewId, 
            empInterview, 
            interviewTime,
            content: Buffer.from(contentsend, 'base64')
        };
        //tao 
        let scheduleInterview = await ScheduleInterview.findOneAndUpdate({canId: canId}, infoInterview, {upsert: true, new: true});
        if(!scheduleInterview){
            functions.setError(res, `Create getJob fail!`, 507);
        }
        //gui email
        let checkEmail = req.body.checkEmail;
        if(checkEmail>0){
            //gui email
            await hrService.sendEmailtoCandidate(email, '[hr.timviec365.vn] Thư mời phỏng vấn', infoInterview.content);
        }

        //
        let {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote} = req.body;
        if(!name || !cvFrom || !userHiring || !recruitmentNewsId || !timeSendCv || !starVote) {
            return functions.setError(res, `Missing input value`, 406);
        }
        //cap nhat thong tin ung vien
        let infoCan = {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote, isSwitch: 1, status: 5};
        let can = await updateInfoCandidate(canId, infoCan);
        if(!can){
            functions.setError(res, `Update info candidate fail`, 506); 
        }
        
        //xoa thang thai ung vien sau khi cap nhat
        await FailJob.deleteOne({canId: canId});
        await CancelJob.deleteOne({canId: canId});
        await ContactJob.deleteOne({canId: canId});
        await GetJob.deleteOne({canId: canId});
        
        //nhac nho
        const maxIdRemind = await Remind.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdRemind;
        if (maxIdRemind) {
            newIdRemind = Number(maxIdRemind.id) + 1;
        } else newIdRemind = 1;

        let comId = req.infoLogin.comId;
        let infoRemind = {id: newIdRemind, type: 0, canId: canId, canName: can.name, comId: comId, userId: empInterview, time: interviewTime};
        let remind = new Remind(infoRemind);
        remind = await Remind.create(remind);
        if(!remind){
            functions.setError(res, `Create remind fail`, 505);    
        }
        return functions.success(res, 'Create scheduleInterview success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.addCandidateGetJob = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let comId = req.infoLogin.comId;
        let {canId, resiredSalary, salary, note, email, contentsend, empInterview, interviewTime} = req.body;

        if(!canId || !salary || !resiredSalary|| !interviewTime || !empInterview || !contentsend || !email) {
            return functions.setError(res, `Missing input value`, 405);
        }
        
        //lay id max
        const maxIdScheduleInterview = await GetJob.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdScheduleInterview;
        if (maxIdScheduleInterview) {
            newIdScheduleInterview = Number(maxIdScheduleInterview.id) + 1;
        } else newIdScheduleInterview = 1;
        
        let infoGetJob = {id: newIdScheduleInterview, canId, resiredSalary, salary, note, email, contentsend, empInterview, interviewTime};
        infoGetJob.contentSend = Buffer.from(contentsend, 'base64');
        
        //tao 
        let getJob = await GetJob.findOneAndUpdate({canId: canId}, infoGetJob, {upsert: true, new: true});
        if(getJob){

            //gui email
            let checkEmail = req.body.checkEmail;
            if(checkEmail>0){
                //gui email
                await hrService.sendEmailtoCandidate(email, '[hr.timviec365.vn] Thư mời nhận việc', infoGetJob.contentSend);
            }

            //
            let {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote} = req.body;
            if(!name || !cvFrom || !userHiring || !recruitmentNewsId || !timeSendCv || !starVote) {
                return functions.setError(res, `Missing input value`, 405);
            }
            //cap nhat thong tin ung vien
            let infoCan = {name, cvFrom, userHiring, timeSendCv, recruitmentNewsId, starVote, isSwitch: 1, status: 1};
            let can = await updateInfoCandidate(canId, infoCan);
            if(!can){
                functions.setError(res, `Update info candidate fail`, 506); 
            }
            
            //xoa thang thai ung vien sau khi cap nhat
            let a = await FailJob.deleteMany({canId: canId});
            let b = await CancelJob.deleteMany({canId: canId});
            let c =await ContactJob.deleteMany({canId: canId});
            await ScheduleInterview.deleteOne({canId: canId});

            // console.log(a, b, c);
            //nhac nho
            const maxIdRemind = await Remind.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
            let newIdRemind;
            if (maxIdRemind) {
                newIdRemind = Number(maxIdRemind.id) + 1;
            } else newIdRemind = 1;

            let infoRemind = {id: newIdRemind, type: 1, canId: canId, canName: can.name, comId: comId, userId: empInterview, time: interviewTime};
            let remind = new Remind(infoRemind);
            remind = await Remind.create(remind);
            if(!remind){
                functions.setError(res, `Create remind fail`, 505);    
            }
        }else {
            functions.setError(res, `Create getJob fail!`, 507);
        }
        
        return functions.success(res, 'Create getJob success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

	// public function detailCandidateGetJob($id)
	// {
	// 	$this->_data['page_title'] 	= 'Chi tiết hồ sơ ứng viên';
	// 	$infoLogin 	= checkRoleUser();
	// 	$this->load->model('M_process_interview');
	// 	$this->_data['list_process_interview'] = $this->M_process_interview->listProcess($infoLogin['com_id']);
	// 	// Danh sách tin đăng
	// 	$this->_data['list_new'] = $this->M_recruitment_new->listNew($infoLogin['com_id']);
	// 	// chi tiết ứng viên
	// 	$this->_data['detail'] = $this->M_candidate->detailCandidateAllNewBy($id);
	// 	$this->_data['another_skill'] = $this->M_another_skill->listSkillBy($id);
	// 	$this->load->model('M_tbl_shedule_interview');
	// 	$this->_data['list_schedule'] = $this->M_tbl_shedule_interview->listSchedule($id);
	// 	$this->load->model('M_tbl_get_job');
	// 	$this->_data['detail_get_job'] = $this->M_tbl_get_job->getDetailBy($id);
	// 	$this->_data['can_id'] = $id;
	// 	// $this->_data['detail_interview'] = $this->M_tbl_shedule_interview->getDetail($id, $process_id);
	// 	$this->load->view('site/profile/t_detail_candidate_get_job', $this->_data);
	// }


exports.detailCandidateGetJob = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let comId = req.infoLogin.comId;
        let canId = req.body.canId;
        if(!canId){
            return functions.setError(res, "Missing input canId!", 405);
        }
        
        let list_process_interview = await ProcessInterview.find({comId: comId}, {id: 1, name: 1}).sort({id: 1}).lean();
        let list_new = await RecruitmentNews.find({comId: comId, isDelete: 0}).sort({id: 1}).lean();
        let detail = await Candidate.findOne({id: canId});
        let another_skill = await AnotherSkill.find({canId: canId});
        let list_schedule = await ScheduleInterview.find({canId: canId});
        let detail_get_job = await GetJob.findOne({canId: canId});
        
        return functions.success(res, 'Get detailCandidateGetJob success!', {list_process_interview, list_new, detail, another_skill, detail_get_job, list_schedule});
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

let detailGenaral = async(comId, canId) => {
    try {
        let list_process_interview = await ProcessInterview.find({comId: comId}, {id: 1, name: 1}).sort({id: 1}).lean();
        let list_new = await RecruitmentNews.find({comId: comId, isDelete: 0}).sort({id: 1}).lean();
        let detail = await Candidate.findOne({id: canId});
        let another_skill = await AnotherSkill.find({canId: canId});
        let list_schedule = await ScheduleInterview.find({canId: canId});
        
        let data = {list_process_interview, list_new, detail, another_skill, list_schedule};
        return data;
    } catch (e) {
        console.log("Err from server!", e);
    }
}

exports.detailCandidateGetJob = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let comId = req.infoLogin.comId;
        let canId = req.body.canId;
        if(!canId){
            return functions.setError(res, "Missing input canId!", 405);
        }
        let data = await detailGenaral(comId, canId);
        let detail_get_job = await GetJob.findOne({canId: canId});
        data.detail_get_job = detail_get_job;
        
        return functions.success(res, 'Get detailCandidateGetJob success!', data);
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.detailCandidateFailJob = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let comId = req.infoLogin.comId;
        let canId = req.body.canId;
        if(!canId){
            return functions.setError(res, "Missing input canId!", 405);
        }
        let data = await detailGenaral(comId, canId);
        let detail_fail_job = await FailJob.findOne({canId: canId});
        data.detail_fail_job = detail_fail_job;
        
        return functions.success(res, 'Get detailCandidateFailJob success!', data);
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.detailCandidateCancelJob = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let comId = req.infoLogin.comId;
        let canId = req.body.canId;
        if(!canId){
            return functions.setError(res, "Missing input canId!", 405);
        }
        let data = await detailGenaral(comId, canId);
        let detail_cancel_job = await CancelJob.findOne({canId: canId});
        data.detail_cancel_job = detail_cancel_job;
        
        return functions.success(res, 'Get detailCandidateCancelJob success!', data);
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.detailCandidateContactJob = async(req, res, next) => {
    try {
        //lay thong tin tu nguoi dung nhap
        let comId = req.infoLogin.comId;
        let canId = req.body.canId;
        if(!canId){
            return functions.setError(res, "Missing input canId!", 405);
        }
        let data = await detailGenaral(comId, canId);
        let detail_contact_job = await ContactJob.findOne({canId: canId});
        data.detail_contact_job = detail_contact_job;
        
        return functions.success(res, 'Get detailCandidateContactJob success!', data);
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}



