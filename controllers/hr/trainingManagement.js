const functions = require('../../services/functions');
const HR_JobDescriptions = require('../../models/hr/JobDescriptions');

// lấy ra danh sách vị trí công viec
exports.getListJobDescription = async (req,res,next) => {
    try {
        
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}