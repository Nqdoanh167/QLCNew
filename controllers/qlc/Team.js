const Team = require('../../models/qlc/Team');
const functions = require("../../services/functions");
const Users = require("../../models/Users")

//tìm kiếm danh sách tổ

exports.getListTeam = async(req, res) => {
    try {
        let com_id = req.body.com_id
        let _id = req.body._id
        let dep_id = req.body.dep_id
        console.log(_id, com_id)
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
            console.log(_id, com_id, dep_id)
            data = await Team.find(condition).select('com_id teamName dep_id deputyteam_id managerteam_id total_emp ')
                // console.log(data)
            const teamID = data.map(item => item._id)
            console.log(teamID)
            for (let i = 0; i < teamID.length; i++) {
                const team = teamID[i];

                console.log(team)
                total_emp = await Users.countDocuments({ "inForPerson.employee.com_id": com_id, "inForPerson.employee.team_id": team, type: 2, "inForPerson.employee.ep_status": "Active" })

                console.log(total_emp)

                await Team.findOneAndUpdate({ com_id: com_id, _id: team }, { $set: { total_emp: total_emp } })
            }

            if (data) {
                return await functions.success(res, 'Lấy thành công', { data });
            };
            return functions.setError(res, 'Không có dữ liệu', 404);
        }

    } catch (err) {
        console.log(err);

        functions.setError(res, err.message)
    }
};

//API đếm số lượng nhân viên trong tổ
exports.countUserInTeam = async(req, res) => {
        try {
            const { dep_id, com_id, team_id } = req.body;
            console.log(dep_id, com_id, team_id)
            const numberUser = await functions.findCount(Users, { "inForPerson.employee.com_id": com_id, "inForPerson.employee.dep_id": dep_id, "inForPerson.employee.team_id": team_id, type: 2 })
                // .then(() => functions.success(res, "",{numberUser}))
                // .catch((err) => functions.setError(res, err.message, 501));
            console.log(numberUser)
            if (!numberUser) {
                functions.setError(res, "Deparment cannot be found or does not exist", 503);
            } else {
                functions.success(res, "Deparment found", { numberUser });
            }
        } catch (e) {
            console.log(e)
            functions.setError(res, "Deparment does not exist", 503);
        }
    }
    //Tạo mới dữ liệu của một tổ
exports.createTeam = async(req, res) => {

    const { dep_id, teamName, com_id, deputyteam_id, managerteam_id, total_emp } = req.body;

    if (!dep_id) {
        //Kiểm tra Id phòng ban có khác null
        functions.setError(res, "Deparment Id required", 604);
    } else if (isNaN(dep_id)) {
        //Kiểm tra Id phòng ban có thuộc kiểu number không
        functions.setError(res, "Deparment Id must be a number", 605);
    } else if (!com_id) {
        //Kiểm tra sắp xếp thứ tự có khác null
        functions.setError(res, "Team order required", 607);
    } else if (isNaN(com_id)) {
        //Kiểm tra sắp xếp thứ tự có phải kiểu number hay không
        functions.setError(res, "Team order must be a number", 608);
    } else {

        //Lấy ID kế tiếp, nếu chưa có giá trị nào thì bằng 1
        let maxID = await functions.getMaxID(Team);
        const team = new Team({
            _id: Number(maxID) + 1 || 1,
            com_id: com_id,
            dep_id: dep_id,
            teamName: teamName,
            deputyteam_id: deputyteam_id || null,
            managerteam_id: managerteam_id || null,
            total_emp: 0
        });

        await team.save()
            .then(() => {
                functions.success(res, "Team created successfully", { team })
            })
            .catch(err => {
                functions.setError(res, err.message, 609);
            })
    }
};

//Chỉnh sửa dự liệu của một tổ
exports.editTeam = async(req, res) => {
    const _id = req.body._id;

    if (isNaN(_id)) {
        functions.setError(res, "Id must be a number", 602)
    } else {
        const { dep_id, teamName, com_id, deputyteam_id, managerteam_id } = req.body

        if (!dep_id) {
            //Kiểm tra Id phòng ban có khác null
            functions.setError(res, "Deparment Id required", 604);
        } else if (isNaN(dep_id)) {
            //Kiểm tra Id phòng ban có thuộc kiểu number không
            functions.setError(res, "Deparment Id must be a number", 605);
        } else if (!teamName) {
            //Kiểm tra tên của tổ có khác null
            functions.setError(res, "Team name required", 606);
        } else if (!com_id) {
            //Kiểm tra sắp xếp thứ tự có khác null
            functions.setError(res, "Team order required", 607);
        } else if (isNaN(com_id)) {
            //Kiểm tra sắp xếp thứ tự có phải kiểu number hay không
            functions.setError(res, "Team order must be a number", 608)
        } else {
            const team = await functions.getDatafindOne(Team, { _id: _id });
            if (!team) {
                functions.setError(res, "Team not exist", 610);
            } else {
                await functions.getDatafindOneAndUpdate(Team, { com_id: com_id, _id: _id }, {
                        dep_id: dep_id,
                        teamName: teamName,
                        com_id: com_id,
                        deputyteam_id: deputyteam_id || null,
                        managerteam_id: managerteam_id || null
                    })
                    .then((team) => functions.success(res, "Team edited successfully", { team }))
                    .catch((err) => functions.setError(res, err.message, 611));
            }

        }
    }


};
//Xóa dữ liệu của một tổ cua 1 cty
exports.deleteTeam = async(req, res) => {
    const { _id, com_id } = req.body
    if ((com_id && _id) == undefined) {
        functions.setError(res, "lack of input", 502);
    } else if (isNaN(_id)) {
        functions.setError(res, "Id must be a number", 602)
    } else {
        await Users.updateOne({ "inForPerson.employee.com_id": com_id, "inForPerson.employee.team_id": _id }, { $set: { "inForPerson.employee.team_id": 0 } })

        const team = await functions.getDatafindOne(Team, { com_id: com_id, _id: _id });
        if (!team) {
            functions.setError(res, "Team does not exist", 610);
        } else {
            functions.getDataDeleteOne(Team, { com_id: com_id, _id: _id })
                .then(() => functions.success(res, "Delete team successfully", { team }))
                .catch(err => functions.setError(res, err.message, 612));
        }
    }


};
//Xoá toàn bộ dữ liệu tổ
exports.deleteAllTeams = async(req, res) => {
    if (!await functions.getMaxID(Team)) {
        functions.setError(res, "No Team existed", 613);
    } else {
        Team.deleteMany()
            .then(() => functions.success(res, "Delete all teams successfully"))
            .catch(() => functions.error(res, err.message, 614));
    }
}