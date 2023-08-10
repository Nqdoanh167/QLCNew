const functions = require('../../services/functions');
const hrService = require('../../services/hr/hrService');
const Users = require('../../models/Users');
const Candidates = require('../../models/hr/Candidates');
const AchievementFors = require('../../models/hr/AchievementFors');
const InfringesFors = require('../../models/hr/InfringesFors');
const GetJob = require('../../models/hr/GetJob');
const Candidate = require('../../models/hr/Candidates');

//---------api home
exports.getListInfo= async(req, res, next) => {
    try {
        let comId = req.infoLogin.comId;
        let totalEmployee = await Users.countDocuments({"inForPerson.employee.com_id": comId});
        let totalAchievement = await AchievementFors.countDocuments({comId: comId});
        let totalInfringe = await InfringesFors.countDocuments({comId: comId});
        let totalCandi = await Candidates.countDocuments({comId: comId, isDelete: 0});
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
        totalCandidateGetJob = totalCandidateGetJob[0].totalDocuments;
        totalCandidateInterview = totalCandidateInterview[0].totalDocuments;

        return functions.success(res, `Get list infomaiton for page home success`, {totalEmployee, totalAchievement, totalInfringe, totalCandi, totalCandidateInterview, totalCandidateGetJob});
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}