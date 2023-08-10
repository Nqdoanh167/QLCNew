const functions = require('../../services/functions');
const qlcnewservice = require('../../services/qlcnew/qlcnewservice');
const Users = require('../../models/Users');
const ChangeDeparmental = require('../../models/qlcnew/changedepartmental');




exports.getAndCheckData = async (req, res, next) =>{
    try{
        //check quyen
        let infoLogin = req.infoLogin;
        console.log("🚀 ~ file: personalChangeController.js:94 ~ exports.getAndCheckData= ~ infoLogin:", infoLogin)
        let checkRole = await qlcnewservice
    .checkRole(infoLogin, 5, 2);
        if(!checkRole) {
            return functions.setError(res, "no right", 444);   
        }
        let {ep_id, com_id, new_com_id, current_position, current_dep_id, update_position, update_dep_id, created_at, decision_id, note, mission} = req.body;
        if(!com_id) {
            com_id = infoLogin.comId;
        }
        if(!ep_id || !created_at) {
            return functions.setError(res, "Missing input value!", 404);
        }
        req.fields = {com_id, ep_id, current_position, current_dep_id, created_at, decision_id, note: Buffer.from(note, 'base64')};
        next();
    }catch(e){
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}
// lay ra danh sach luan chuyen cong tac
exports.getListChangeDepartmental = async(req, res, next) => {
    try {
        //check quyen
        let infoLogin = req.infoLogin;
        let com_id = infoLogin.comId;
        let checkRole = await qlcnewservice
    .checkRole(infoLogin, 4, 1);
        if(!checkRole) {
            return functions.setError(res, "no right", 444);   
        }
        //
        let {page, pageSize, ep_id, update_dep_id, fromDate, toDate} = req.body;
        if(!page || !pageSize){
            return functions.setError(res, "Missing input page or pageSize", 401);
        }
        
        page = Number(req.body.page);
        pageSize = Number(req.body.pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let listCondition = {com_id: com_id};

        // dua dieu kien vao ob listCondition
        if(ep_id) listCondition.ep_id = Number(ep_id);
        if(update_dep_id) listCondition.update_dep_id = Number(update_dep_id);
        if(fromDate) listCondition.created_at = {$gte: new Date(fromDate)};
        if(toDate) listCondition.created_at = {$lte: new Date(toDate)};

        // const listChangeDeparmental = await functions.pageFind(ChangeDeparmental, listCondition, { _id: 1 }, skip, limit); 
        let fields = {com_id: 1, ep_id: 1, current_position: 1, current_dep_id: 1, update_position: 1, update_dep_id: 1, created_at: 1, decision_id: 1, note: 1, userName: 1}
        let listChangeDeparmental = await ChangeDeparmental.aggregate([
        {$match: listCondition},
        {
            $lookup: {
            from: "Users",
            localField: "ep_id",
            foreignField: "_id",
            as: "matchedDocuments"
            }
        },
        {
            $unwind: "$matchedDocuments"
        },
        {
            $replaceRoot: {
            newRoot: {
                $mergeObjects: ["$$ROOT", "$matchedDocuments"]
            }
            }
        },
        {
            $project: fields
        },
        // {$project: fields},
        {$sort: {id: 1}},
        {$skip: skip},
        {$limit: limit}
        ]);
        const totalCount = await functions.findCount(ChangeDeparmental, listCondition);
        return functions.success(res, "Get list appoint success", {totalCount: totalCount, data: listChangeDeparmental });
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.updateChangeDepartmental = async(req, res, next) => {
    try {
        let {update_position, update_dep_id, mission, new_com_id} = req.body;
        if(!update_position || !update_dep_id || !mission || !new_com_id) {
            return functions.setError(res, "Missing input value!", 405);
        }
        
        let fields = req.fields;

        //lay ra id lon nhat
        let ep_id = req.fields.ep_id;
        let com_id = req.infoLogin.comId;
        //update nhan vien
        let employee = await Users.findOneAndUpdate({idQLC: fields.ep_id}, {
            inForPerson: {
                employee: {
                    com_id: new_com_id,
                    dep_id: update_dep_id,
                    position_id: update_position
                }
            }
        }, {new: true})
        if(!employee){
            return functions.setError(res, "Employee not found!", 503);
        }

        let check = await ChangeDeparmental.findOne({com_id: com_id, ep_id: ep_id});
        if(!check) {
            let newIdChangeDeparmental = await ChangeDeparmental.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
            if (newIdChangeDeparmental) {
                newIdChangeDeparmental = Number(newIdChangeDeparmental._id) + 1;
            } else newIdChangeDeparmental = 1;
            fields._id = newIdChangeDeparmental;
        }

        //them cac truong cho phan bo nhiem vao
        fields = {...fields, update_position, update_dep_id, mission: Buffer.from(mission), new_com_id};

        //neu chua co thi them moi
        let ChangeDeparmental = await ChangeDeparmental.findOneAndUpdate({com_id: com_id, ep_id: ep_id},fields, {new: true, upsert: true});
        if(ChangeDeparmental){
            return functions.success(res, "Update ChangeDeparmental success!");
        }
        return functions.setError(res, "ChangeDeparmental not found!", 405);
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}

//xoa 
exports.deleteChangeDepartmental = async(req, res, next) => {
    try {
        //check quyen
        let infoLogin = req.infoLogin;
        let checkRole = await qlcnewservice
    .checkRole(infoLogin, 5, 2);
        if(!checkRole) {
            return functions.setError(res, "no right", 444);   
        }

        let ep_id = req.body.ep_id;
        if(!ep_id){
            return functions.setError(res, "Missing input value ep_id", 404);
        }
        let ChangeDeparmental = await functions.getDataDeleteOne(ChangeDeparmental ,{ep_id: ep_id});
        if (ChangeDeparmental.deletedCount===1) {
            return functions.success(res, `Delete appoint with ep_id=${ep_id} success`);
        }
        return functions.setError(res, "ChangeDeparmental not found", 505);
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}
//delete user permanent
exports.deleteUser = async(req, res, next) => {
    try {
        let idQLC = req.query.idQLC;
        let type = 0;
        if (idQLC) {
            let user = await functions.getDataDeleteOne(Users ,{idQLC: idQLC, type: type});
            if (user.deletedCount===1) {
                return functions.success(res, "Delete user by idQLC success");
            }else{
                return functions.success(res, "user not found");
            }
        } else {
            return functions.setError(res, "Missing input data", 400);
        }
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}
