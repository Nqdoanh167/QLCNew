const PermissionNotify = require('../../models/Timviec365/PermissionNotify');
const Users = require('../../models/Users');
const functions = require('../../services/functions');

exports.list = async(req, res) => {
    const user = req.user.data;
    const list = await PermissionNotify.find({ pn_usc_id: user.idTimViec365, pn_id_new: 0 }).select("pn_id_chat pn_type_noti");
    return functions.success(res, "Danh sách quyền", { list });
}

exports.getUserByIdChat = async(req, res) => {
    try {
        const Infor = req.body.Infor;
        if (Infor) {
            const listUser = await Users.aggregate([{
                    $match: {
                        $or: [{ email: Infor }, { phoneTK: Infor }]
                    }
                }, {
                    $project: {
                        _id: 1,
                        "type365": "$type",
                        userName: 1,
                    }
                }

            ]);
            return functions.success(res, "Danh sách thông tin", { listUser });
        }
        return functions.setError(res, "Thiếu thông tin truyền lên");
    } catch (error) {
        return functions.setError(res, error);
    }
}