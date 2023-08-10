const Invitation = require("../../models/qlcnew/invitation");
const functions = require("../../services/functions");
const Users = require("../../models/Users");

// hiển thị tất cả lời mòi
exports.getAllInvation = async (req, res) => {
    await functions.getDatafind(Invitation, {})
        .then((invations) => functions.success(res, "Get data successfully", invations))
        .catch((err) => functions.setError(res, err.message))
}
// xóa một lời mời
exports.deleteInvitation = async (req, res) => {
    const _id = req.body.id;

    if (isNaN(_id)) {
        functions.setError(res, "Id must be a number");
    } else {
        const invation = await functions.getDatafindOne(Invitation, { _id: _id });
        if (!invation) {
            functions.setError(res, "Invation does not exist");
        } else {
            await functions.getDataDeleteOne(Invitation, { _id: _id })
                .then(() => functions.success(res, "Delete invitation successfully", invation))
                .catch((err) => functions.setError(res, err.message));
        }
    }
}
//chỉnh sửa một lời mời
exports.editInvitation = async (req, res) => {
    const _id = req.body.id;
    const timeExpired = req.body.timeExpried;
    if (isNaN(_id)) {
        functions.setError(res, "Id must be a number");

    } else {

        if (isNaN(timeExpired)) {
            return res.status(400).json({ error: "TimeExpired must be a number" });
        }
        else {
            const invitation = await functions.getDatafindOne(invitation, { _id: _id });
            if (!invitation) {
                functions.setError(res, "invitation does not exist");
            } else {
                await functions.getDatafindOneAndUpdate(Invitation, { _id: _id }, {
                    timeExpired: timeExpired
                })
                    .then((data) => functions.success(res, "invitation edited successfully", data))
                    .catch((err) => functions.setError(res, err.message));
            }
        }
    }
}


// Lấy ra danh sách chấp nhận
exports.getAceptedInvitation = async (req, res) => {

    await functions.getDatafind(Invitation, { status: 'accepted' })
        .then((invations) => functions.success(res, "Get data successfully", invations))
        .catch((err) => functions.setError(res, err.message))

}

//Lấy ra danh sách bị từ chối
exports.getDeniedInvitation = async (req, res) => {

    await functions.getDatafind(Invitation, { status: ' denied' })
        .then((invations) => functions.success(res, "Get data successfully", invations))
        .catch((err) => functions.setError(res, err.message))

}


// Cập nhật pending thành expried
async function checkAndExpireInvitations() {
    try {
        const pendingInvitations = await functions.getDatafind(Invitation, { status: ' pending' });

        // Lặp qua danh sách các lời mời "pending" để kiểm tra và cập nhật trạng thái
        for (const invitation of pendingInvitations) {
            const timeCreated = moment(invitation.createdAt);
            const currentTime = moment();
            const timeExpired = timeCreated.add(3, 'days'); // Thêm 3 ngày từ ngày tạo

            // So sánh thời gian hiện tại với thời gian hết hạn
            if (currentTime.isAfter(timeExpired)) {
                // Nếu thời gian hiện tại đã sau thời gian hết hạn, cập nhật trạng thái thành "expired"
                invitation.status = 'expired';
                await invitation.save();
            }
        }
    } catch (error) {
        console.error('Error checking and expiring invitations:', error);
    }
}
//Lấy ra danh sách đang pending
exports.getPendingInvitation = async (req, res) => {
    try {
        // Gọi hàm kiểm tra và cập nhật trạng thái lời mời "pending" thành "expired"
        await checkAndExpireInvitations();

        // Lấy danh sách các lời mời "pending" sau khi đã kiểm tra và chuyển trạng thái
        const pendingInvitations = await functions.getDatafind(Invitation, { status: ' pending' });
        // Trả về danh sách các lời mời "pending"
        if (pendingInvitations) {
            return await functions.success(res, ' lấy danh sách lời mời đang chờ thành công', { pendingInvitations })
        }
        else {
            return functions.setError(res, 'Không có dữ liệu', 404);

        }
    } catch (err) {
        // Nếu xảy ra lỗi, trả về thông báo lỗi
        functions.setError(res, err.message);

    }
};
//Lấy ra danh sách lời mời hết hạn
exports.getExpiredInvitation = async (req, res) => {
    try {
        // Gọi hàm kiểm tra và cập nhật trạng thái lời mời "pending" thành "expired"
        await checkAndExpireInvitations();

        // Lấy danh sách các lời mời "pending" sau khi đã kiểm tra và chuyển trạng thái
        const ExpiredInvitations = await functions.getDatafind(Invitation, { status: ' expired' });
        // Trả về danh sách các lời mời "pending"
        if (ExpiredInvitations) {
            return await functions.success(res, ' lấy danh sách lời mời đang chờ thành công', { ExpiredInvitations })
        }
        else {
            return functions.setError(res, 'Không có dữ liệu', 404);

        }
    } catch (err) {
        // Nếu xảy ra lỗi, trả về thông báo lỗi
        functions.setError(res, err.message);

    }
};




// API để lấy chi tiết lời mời dựa vào ID
exports.getInvitationDetailById = async (req, res) => {

    try {
        const _id = req.body.id;
        const companyID = req.body.companyID;

        // Tìm lời mời dựa vào ID
        const data = await functions.getDatafindOne(Invitation, { _id: _id });


        // Kiểm tra xem lời mời có tồn tại không
        if (!data) {
            // Nếu không tìm thấy, trả về thông báo lỗi
            return await functions.success(res, 'Lấy lời mời thành công', data);

        }

        // Lấy thông tin người nhận từ bảng User
        const receiverUser = await functions.getDatafindOne(Users, { idQLC: Invitation.em_id_receive }, { password: 0 });

        // Lấy thông tin người gửi từ bảng User
        const senderUser = await functions.getDatafindOne(Invitation, { companyID: companyID });

        // Tạo đối tượng chi tiết lời mời để trả về
        const invitationDetail = {
            data: data,
            sender: senderUser,
            receiver: receiverUser

        };

        // Trả về thông tin chi tiết của lời mời, thông tin người nhận và thông tin người gửi
        if (data) {
            return await functions.success(res, 'Lấy thông tin chi tiết lời mời thành công', invitationDetail);
        }
        return functions.setError(res, 'Không có dữ liệu', 404);
    } catch (error) {
        // Nếu xảy ra lỗi, trả về thông báo lỗi
        functions.setError(res, err.message);

    }
};





