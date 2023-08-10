const functions = require('../../services/functions');
const hrService = require('../../services/hr/hrService');
const JobDescription = require('../../models/hr/JobDescriptions');
const ProcessTraining = require('../../models/hr/ProcessTraining');
const StageProcessTraining = require('../../models/hr/StageProcessTraining');
const folderFile = 'job';

// lay ra danh sach cac vi tri cong viec trong cty
exports.getListJobDescription= async(req, res, next) => {
    try {
        let {page, pageSize, name} = req.body;
        if(!page || !pageSize){
            return functions.setError(res, "Missing input page or pageSize", 401);
        }
        page = Number(req.body.page);
        pageSize = Number(req.body.pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        
        let listCondition = {comId: req.infoLogin.comId, isDelete: 0};

        // dua dieu kien vao ob listCondition
        if(name) listCondition.name =  new RegExp(name, 'i');
        const listJob = await functions.pageFind(JobDescription, listCondition, { _id: 1 }, skip, limit); 
        const totalCount = await functions.findCount(JobDescription, listCondition);
        return functions.success(res, "Get list job description success", {totalCount: totalCount, data: listJob });
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.createJobDescription = async(req, res, next) => {
    try {
        let {name, depName, des, jobRequire} = req.body;
        if(!name || !depName || !des || !jobRequire) {
            return functions.setError(res, "Missing input value!", 404);
        }
        //lay id max
        const comId = req.infoLogin.comId;
        const maxIdJob = await JobDescription.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdJob;
        if (maxIdJob) {
            newIdJob = Number(maxIdJob.id) + 1;
        } else newIdJob = 1;

        let roadMap = req.files.roadMap;
        let nameFile = '';
        let linkFil = '';
        if(roadMap) {
            if(!await hrService.checkFile(roadMap.path)){
                return functions.setError(res, 'ảnh sai định dạng hoặc lớn hơn 20MB', 405);
            }
            nameFile = await hrService.uploadFileRoadMap(comId,roadMap);
            linkFile = await hrService.createLinkFile(folderFile, comId, roadMap.name);
        }
        
        //tao quy trinh
        let job = new JobDescription({
            id: newIdJob,
            name: name,
            depName: depName,
            des: des,
            jobRequire: jobRequire,
            roadMap: nameFile,
            comId: comId
        });
        job = await job.save();
        return functions.success(res, 'Create job description success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.softDeleteJobDescription = async(req, res, next) => {
    try {
        let jobId = req.body.jobId;
        if(!jobId){
            return functions.setError(res, "Missing input jobId", 404);
        }
        let job = await JobDescription.findOneAndUpdate({id: jobId}, {
            deletedAt: Date.now(),
            isDelete: 1
        })
        if(!job) {
            return functions.setError(res, "JobDescription not found!", 505);
        }
        return functions.success(res, "Soft delete JobDescription success!");
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}

//----------------------quy trinh dao tao

// lay ra danh sach quy trinh dao tao
exports.getListProcessTraining= async(req, res, next) => {
    try {
        //check quyen
        let infoLogin = req.infoLogin;
        let comId = infoLogin.comId;
        let checkRole = await hrService.checkRole(infoLogin, 4, 1);
        if(!checkRole) {
            return functions.setError(res, "no right", 444);   
        }
        //
        let {page, pageSize, name, processTrainId} = req.body;
        if(!page || !pageSize){
            return functions.setError(res, "Missing input page or pageSize", 401);
        }
        
        page = Number(req.body.page);
        pageSize = Number(req.body.pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        
        let listCondition = {comId: comId};

        // dua dieu kien vao ob listCondition
        if(name) listCondition.name =  new RegExp(name);
        if(processTrainId) listCondition.id =  processTrainId;
        const listProcess = await functions.pageFind(ProcessTraining, listCondition, { _id: 1 }, skip, limit); 
        const totalCount = await functions.findCount(ProcessTraining, listCondition);
        return functions.success(res, "Get list process training success", {totalCount: totalCount, data: listProcess });
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.getDetailProcessTraining= async(req, res, next) => {
    try {
        //check quyen
        let infoLogin = req.infoLogin;
        let comId = infoLogin.comId;
        let checkRole = await hrService.checkRole(infoLogin, 4, 1);
        if(!checkRole) {
            return functions.setError(res, "no right", 444);   
        }
        //
        let processTrainId = req.body.processTrainId;
        if(!processTrainId){
            return functions.setError(res, "Missing input processTrainId", 504);  
        }
        var processTrain = await ProcessTraining.findOne({id: processTrainId});
        if(!processTrain) {
            return functions.setError(res, "process training not found", 504);   
        }

        let listStage = await StageProcessTraining.find({trainingProcessId: processTrainId});
        return functions.success(res, "Get list process training success", {processTrain, listStage});
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.createProcessTraining = async(req, res, next) => {
    try {
        //check quyen
        let infoLogin = req.infoLogin;
        let comId = infoLogin.comId;
        let checkRole = await hrService.checkRole(infoLogin, 4, 2);
        if(!checkRole) {
            return functions.setError(res, "no right", 444);   
        }
        //
        let {name, description} = req.body;
        if(!name || !description) {
            return functions.setError(res, "Missing input value!", 404);
        }
        //lay id max
        let newIdProcessTrain = await ProcessTraining.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        if (newIdProcessTrain) {
            newIdProcessTrain = Number(newIdProcessTrain.id) + 1;
        } else newIdProcessTrain = 1;

        //tao quy trinh
        let processTrain = new ProcessTraining({
            id: newIdProcessTrain,
            name: name,
            description: description,
            comId: comId
        });
        processTrain = await processTrain.save();
        
        return functions.success(res, 'Create process train success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.softDeleteProcessTraining = async(req, res, next) => {
    try {
        let processTrainId = req.body.processTrainId;
        if(!processTrainId){
            return functions.setError(res, "Missing input processTrainId", 404);
        }
        let job = await ProcessTraining.findOneAndUpdate({id: processTrainId}, {
            deletedAt: Date.now(),
            isDelete: 1
        })
        if(!job) {
            return functions.setError(res, "ProcessTraining not found!", 505);
        }
        return functions.success(res, "Soft delete ProcessTraining success!");
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}

// giai doan trong quy trinh dao tao


//them moi giai doan
exports.createStageProcessTraining = async(req, res, next) => {
    try {
        let {name ,objectTraining, content, trainingProcessId} = req.body;
        if(!name || !objectTraining || !content || !trainingProcessId) {
            return functions.setError(res, "Missing input value!", 404);
        }
        //lay id max
        const maxIdStageTraining = await StageProcessTraining.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let newIdStageTraining;
        if (maxIdStageTraining) {
            newIdStageTraining = Number(maxIdStageTraining.id) + 1;
        } else newIdStageTraining = 1;
        
        //tao cac giai doan cua quy trinh do
        let stageProcessTraining = new StageProcessTraining({
            id: newIdStageTraining,
            name: name,
            objectTraining: objectTraining,
            content: content,
            trainingProcessId: trainingProcessId
        });
        await StageProcessTraining.create(stageProcessTraining);
        return functions.success(res, 'Create stage training success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

// chinh sua 
exports.updateStageProcessTraining = async(req, res, next) => {
    try {
        let {name ,objectTraining, content, stageProcessTrainingId} = req.body;
        if(!name || !objectTraining || !content || !stageProcessTrainingId) {
            return functions.setError(res, "Missing input value!", 404);
        }
        //
        const stageRecruit = await StageProcessTraining.findOneAndUpdate({id: stageProcessTrainingId}, {
            name: name,
            objectTraining: objectTraining,
            content: content,
            updatedAt: Date.now()
        })
        if(!stageRecruit) {
            return functions.setError(res, "Stage training not found!", 505);
        }
        return functions.success(res, "update state training success!");
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

// xoa
exports.softDeleteStageProcessTraining = async(req, res, next) => {
    try {
        let stageProcessTrainingId = req.body.stageProcessTrainingId;
        let recruitment = await StageProcessTraining.findOneAndUpdate({id: stageProcessTrainingId}, {
            deletedAt: Date.now(),
            isDelete: 1
        })
        if(!recruitment) {
            return functions.setError(res, "Stage training not found!", 505);
        }
        return functions.success(res, "Soft delete stage training success!");
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}