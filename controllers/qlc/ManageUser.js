const manageUser = require("../../models/Users")
const functions = require("../../services/functions")
const md5 = require('md5');

//tìm danh sách admin va nv
exports.getlistAdmin = async(req, res) => {
    try{
        const pageNumber = req.body.pageNumber || 1;
        let com_id = req.body.com_id
        let idQLC = req.body.idQLC;
        let dep_id = req.body.dep_id
        let role = req.body.role

        let condition = {};
        //Function tìm user là TK nhân viên và TK Cty
        if((com_id)==undefined){
            functions.setError(res,"lack of input")
        }else if(isNaN(com_id)){
            functions.setError(res,"id must be a Number")
        }else{
            if(idQLC) condition.idQLC = idQLC
            if(dep_id) condition.dep_id = "inForPerson.employee.dep_id"
            if(role) condition.role = role
            console.log(idQLC,dep_id,role)
            const data = await manageUser.find(condition).select('userName phoneTK email inForPerson.employee.dep_id inForPerson.employee.positionID ').skip((pageNumber - 1) * 20).limit(20).sort({ _id : 1});
            if (data) {
                return await functions.success(res, 'Lấy thành công', { data, pageNumber });
            };
            return functions.setError(res, 'Không có dữ liệu', 404);
        }
   
    }catch(err){
    console.log(err);
    
    functions.setError(res,err.message)
    }
};
//tao nv
exports.createUser = async(req, res) => {

    const {com_id, userName, email, phoneTK,idQLC, password,role,address,birthday,dep_id,group_id,team_id,positionID, gender,ep_status, createdAt} = req.body;

    if ((com_id&&userName&& email&& password&&role&&address&&positionID&& gender)==undefined) {
        //Kiểm tra tên nhân viên khác null
        functions.setError(res, "input required", 506);
    } else if (isNaN(com_id)) {
        //Kiểm tra sdt có phải là số không
        functions.setError(res, "number phone must be a number", 508);

    } else {
        const manager = await functions.getDatafindOne(manageUser, { email: email, type: 2 });
            if (manager) {
                functions.setError(res, "email đã tồn tại!", 510);
            }else {
                        //Lấy ID kế tiếp, nếu chưa có giá trị nào thì bằng 0 có giá trị max thì bằng max + 1 
        let maxID = await functions.getMaxID(manageUser);
        if (!maxID) {
            maxID = 0
        };
        const _id = Number(maxID) + 1;
        const ManagerUser = new manageUser({
            _id : _id,
            idQLC: Number(maxID) + 1 || idQLC,
            "inForPerson.employee.com_id": com_id,
            userName: userName,
            email: email,
            phoneTK: phoneTK,
            password: md5(password),
            "inForPerson.account.gender": gender,
            "inForPerson.account.birthday": birthday,
            address: address,
            "inForPerson.employee.positionID": positionID,
            type: 2,
            "inForPerson.employee.dep_id": dep_id,
            "inForPerson.employee.group_id": group_id,
            "inForPerson.employee.team_id":team_id,
            "inForPerson.employee.ep_status": ep_status,
            role : role,
            createdAt: Date.now()
        });

        await ManagerUser.save()
            .then(() => {
                functions.success(res, "user created successfully", {ManagerUser})
            })
            .catch((err) => {
                functions.setError(res, err.message, 509);
            })
            }

    }
};


// chỉnh sửa
exports.editUser = async(req, res) => {

    const {com_id, userName, email, phoneTK,idQLC, password,role,address,birthday,dep_id,group_id,team_id,positionID, gender, createdAt} = req.body;

    if ((com_id&&userName&& email&&idQLC&& password&&role&&address&&positionID&& gender)==undefined) {
        //Kiểm tra tên nhân viên khác null
        functions.setError(res, "info required", 506);
    } else if (isNaN(com_id)) {
        //Kiểm tra sdt có phải là số không
        functions.setError(res, "number phone must be a number", 508);

    } else {

        

            const manager = await functions.getDatafindOne(manageUser, { idQLC: idQLC, type: 2 });
            if (!manager) {
                functions.setError(res, "manager does not exist!", 510);
            } else {
                await functions.getDatafindOneAndUpdate(manageUser, { idQLC: idQLC, type: 2 }, {
                    "inForPerson.employee.com_id": com_id,
                    userName: userName,
                    email: email,
                    phoneTK: phoneTK,
                    password: md5(password),
                    "inForPerson.account.gender": gender,
                    "inForPerson.account.birthday": birthday,
                    address: address,
                    "inForPerson.employee.positionID": positionID,
                    type: 2,
                    "inForPerson.employee.dep_id": dep_id,
                    "inForPerson.employee.group_id": group_id,
                    "inForPerson.employee.team_id":team_id,
                    "inForPerson.employee.ep_status": ep_status,
                    role : role,

                    })
                    .then((manager) => functions.success(res, "Deparment edited successfully", {manager}))
                    .catch((err) => functions.setError(res, err.message, 511));
            }
        }
    }

//xoa nhan vien
exports.deleteUser = async(req, res) => {
    //tạo biến đọc idQLC
    const com_id = req.body.com_id;
    const idQLC = req.body.idQLC;

    //nếu idQLC không phải số
    if(isNaN(idQLC,com_id)) {
        functions.setError(res, "Id must be a number", 502);
    } else { // thì tìm trong 1 idQLC trong user model 
        const manager = await functions.getDatafindOne(manageUser, {"inForPerson.employee.com_id":com_id, idQLC: idQLC, type: 2 });
        if (!manager) { //nếu biến manager không tìm thấy  trả ra fnc lỗi 
            functions.setError(res, "user not exist!", 510);
        } else { //tồn tại thì xóa 
            functions.getDataDeleteOne(manageUser, { idQLC: idQLC })
                .then(() => functions.success(res, "Delete user successfully!", {manager}))
                .catch(err => functions.setError(res, err.message, 512));
        }
    }
};


exports.deleteAllUser = async(req, res) => {
    if (!await functions.getMaxID(manageUser)) {
        functions.setError(res, "No manager existed", 513);
    } else {
        manageUser.deleteMany()
            .then(() => functions.success(res, "Delete all companies successfully"))
            .catch(err => functions.setError(res, err.message, 514));
    }
}