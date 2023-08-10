const functions = require("../../services/functions");
const Group = require('../../models/qlc/Group');
const Users = require("../../models/Users")

//tìm kiếm danh sách nhom

exports.getListGroupByFields = async(req, res) => {
    try {
        let com_id = req.body.com_id
        let _id = req.body._id
        let dep_id = req.body.dep_id
        let team_id = req.body.team_id
        let data = []
        let condition = {}
        let total_emp = {}
        if ((com_id) == undefined) {
            functions.setError(res, "lack of input")
        } else if (isNaN(com_id)) {
            functions.setError(res, "id must be a Number")
        } else {
            if (com_id) condition.com_id = com_id
            if (_id) condition._id = _id
            if (dep_id) condition.dep_id = dep_id
            if (team_id) condition.team_id = team_id
            data = await Group.find(condition).select('team_id groupName dep_id managerId deputyManagerId total_emp ')
            const groupID = data.map(item => item._id)
            for (let i = 0; i < groupID.length; i++) {
                const group = groupID[i];

                total_emp = await Users.countDocuments({ "inForPerson.employee.com_id": com_id, "inForPerson.employee.group_id": group, type: 2, "inForPerson.employee.ep_status": "Active" })


                await Group.findOneAndUpdate({ com_id: com_id, _id: group }, { $set: { total_emp: total_emp } })
            }

            if (!data) {
                return functions.setError(res, 'Không có dữ liệu', 404);
            } else {

                return functions.success(res, 'Lấy thành công', { data });
            }
        }

    } catch (err) {
        return functions.setError(res, err.message)
    }
};

//Tạo mới dữ liệu của một nhom
exports.createGroup = async(req, res) => {

    const { dep_id, team_id, groupName, com_id, deputyManagerId, managerId, total_emp, groupCreated } = req.body;

    if ((dep_id && com_id && team_id && groupName) == undefined) {
        functions.setError(res, "input required", 604);
    } else if (isNaN(dep_id && team_id && com_id)) {
        functions.setError(res, "some Id must be a number", 605);
    } else {

        //Lấy ID kế tiếp, nếu chưa có giá trị nào thì bằng 1
        let maxID = await functions.getMaxID(Group);
        const data = new Group({
            _id: Number(maxID) + 1 || 1,
            com_id: com_id,
            dep_id: dep_id,
            team_id: team_id,
            groupName: groupName,
            deputyManagerId: deputyManagerId || null,
            managerId: managerId || null,
            total_emp: 0,
            groupCreated: new Date()
        });

        await data.save()
            .then(() => {
                functions.success(res, "data created successfully", { data })
            })
            .catch(err => {
                functions.setError(res, err.message, 609);
            })
    }
};
//API thay đổi thông tin của một nhóm

exports.editGroup = async(req, res) => {
    const { dep_id, team_id, groupName, com_id, deputyManagerId, managerId, total_emp, groupCreated } = req.body;

    if ((dep_id || com_id || team_id || groupName) == undefined) {
        functions.setError(res, "input required", 604);
    } else if (isNaN(dep_id && team_id && com_id)) {
        functions.setError(res, "some Id must be a number", 605);
    } else {
        const data = await functions.getDatafindOne(Group, { com_id: com_id, dep_id: dep_id, team_id: team_id, _id: _id });
        if (!data) {
            functions.setError(res, "Group not exist", 610);
        } else {
            await functions.getDatafindOneAndUpdate(Group, { com_id: com_id, dep_id: dep_id, team_id: team_id, _id: _id }, {
                    dep_id: dep_id,
                    groupName: groupName,
                    com_id: com_id,
                    team_id: team_id,
                    deputyManagerId: deputyManagerId || null,
                    managerId: managerId || null
                })
                .then((data) => functions.success(res, "Group edited successfully", { data }))
                .catch((err) => functions.setError(res, err.message, 611));
        }

    }



};
//API Xóa một nhóm theo id

exports.deleteGroup = async(req, res) => {
    const { _id, com_id } = req.body
    if ((com_id && _id) == undefined) {
        functions.setError(res, "lack of input", 502);
    } else if (isNaN(_id)) {
        functions.setError(res, "Id must be a number", 602)
    } else {
        await Users.updateOne({ "inForPerson.employee.com_id": com_id, "inForPerson.employee.group_id": _id }, { $set: { "inForPerson.employee.group_id": 0 } })

        const data = await functions.getDatafindOne(Group, { com_id: com_id, _id: _id });
        if (!data) {
            functions.setError(res, "Group does not exist", 610);
        } else {
            functions.getDataDeleteOne(Group, { com_id: com_id, _id: _id })
                .then(() => functions.success(res, "Delete data successfully", { data }))
                .catch(err => functions.setError(res, err.message, 612));
        }
    }


};