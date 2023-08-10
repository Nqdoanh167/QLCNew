var express = require('express');
var router = express.Router();
const toolHr =  require('../../controllers/tools/hr');


// api quét data recruitment
router.post('/toolcancelJob',toolHr.cancelJob)
router.post('/toolFailJob',toolHr.failJob)
router.post('/toolContactJob',toolHr.contactJob)
router.post('/toolNotify',toolHr.notify)
router.post('/toolPermission',toolHr.permission)
router.post('/toolPolicys',toolHr.policy)
router.post('/toolstageRecruitment',toolHr.stageRecruitment)
// router.post('/toolsS')
// router.post('/toolsProvisionsOfCompany', toolHr.)

// api quét data HR Cường
router.post('/toolAchievementFors',toolHr.AchievementFors)
router.post('/toolAddInfoLeads',toolHr.AddInfoLeads)
router.post('/toolBlogs',toolHr.Blogs)
router.post('/toolCategorys',toolHr.Categorys)
router.post('/toolCiSessions',toolHr.CiSessions)
router.post('/toolCitys',toolHr.Citys)
router.post('/toolCrontabQuitJobs',toolHr.CrontabQuitJobs)
router.post('/toolDepartmentDetails',toolHr.DepartmentDetails)
router.post('/toolDescPositions',toolHr.DescPositions)
router.post('/toolDevices',toolHr.Devices)
router.post('/toolInfoLeaders',toolHr.InfoLeaders)
router.post('/toolInfringesFors',toolHr.InfringesFors)
router.post('/toolavatar',toolHr.avatar)
router.post('/toolCandidates',toolHr.Candidates)
router.post('/toolEmployeePolicys',toolHr.EmployeePolicys)
router.post('/toolEmployeePolicySpecifics',toolHr.EmployeePolicySpecifics)


// api
//----------------------------------------------api quet data HR----------------------
router.post('/jobDes',toolHr.toolJobDes);
router.post('/anotherSkill', toolHr.toolAnotherSkill);
router.post('/perDetail', toolHr.toolPermisionDetail);
router.post('/remind', toolHr.toolRemind);
router.post('/processInter', toolHr.toolProcessInterview);
router.post('/processTraining', toolHr.toolProcessTraining);
router.post('/signature', toolHr.toolSignatureImage);
router.post('/scheduleInter', toolHr.toolScheduleInterview);
router.post('/inviteInter', toolHr.toolInviteInterview);
router.post('/recruitment', toolHr.toolRecruitment);
router.post('/recruitmentNews', toolHr.toolRecruitmentNews);

module.exports = router;