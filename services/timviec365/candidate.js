// Khai báo service
const functions = require('../functions');
const serviceNew365 = require('../../services/timviec365/new');

// Khai báo models
const Candidate = require('../../models/Users');
const Evaluate = require('../../models/Timviec365/Evaluate');
const applyForJob = require('../../models/Timviec365/UserOnSite/Candicate/ApplyForJob');
const NewTV365 = require('../../models/Timviec365/UserOnSite/Company/New');
const Notification = require('../../models/Timviec365/Notification');
const pointUsed = require('../../models/Timviec365/UserOnSite/Company/ManagerPoint/PointUsed');


exports.evaluate = async(use_id, com_id, type, content) => {
    // Check xem đã đánh giá hay chưa
    const evaluate = await Evaluate.findOne({
            usc_id: com_id,
            use_id: use_id
        }).lean(),
        now = functions.getTimeNow();

    // Nếu chưa đánh giá thì lưu lại vào bảng
    if (!evaluate) {
        const getItemMax = await Evaluate.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
        let data = {
            id: getItemMax.id + 1,
            usc_id: com_id,
            use_id: use_id,
            time_create: now
        };
        if (type == 1) {
            data.bx_uv = content;
        } else {
            data.bx_ntd = content;
        }
        const item = new Evaluate(data);
        item.save();
    } else {
        let condition = {
            time_create: now
        };
        if (type == 1) {
            condition.bx_uv = content;
        } else {
            condition.bx_ntd = content;
        }
        await Evaluate.updateOne({
            id: evaluate.id
        }, {
            $set: condition
        });
    }
}

exports.applyJob = async(new_id, use_id) => {
    const now = functions.getTimeNow();

    // Check xem đã ứng tuyển tin hay chưa
    const checkApplyForJob = await applyForJob.findOne({
        nhs_new_id: new_id,
        nhs_use_id: use_id,
        nhs_kq: { $ne: 10 }
    });
    if (!checkApplyForJob) {
        /* So sánh địa điểm tuyển dụng với tỉnh thành làm việc, tỉnh thành nơi ứng viên sinh 
        sống của ứng viên xem ứng viên có ứng tuyển sai hay không? */

        let user = await Candidate.aggregate([{
            $match: { idTimViec365: use_id, type: { $ne: 1 } }
        }, {
            $project: {
                city: 1,
                cv_city_id: "$inForPerson.candidate.cv_city_id"
            }
        }]);
        user = user[0];

        const job = await NewTV365.findOne({ new_id: new_id }, {
            new_city: 1,
            new_user_id: 1
        }).lean();
        let nhs_xn_uts = 1;

        if (job.new_city.indexOf(0) < 0) {
            for (let i = 0; i < job.new_city.length; i++) {
                const new_city = job.new_city[i];
                /* Nếu như địa điểm làm việc đó nằm trong ds địa điểm mong muốn 
                và khác với tỉnh thành sinh sống thì xác nhận ứng tuyển đúng */
                if (user.cv_city_id.indexOf(new_city) > -1 || new_city == user.city) {
                    nhs_xn_uts = 0;
                    break;
                }
            }
        } else {
            nhs_xn_uts = 0;
        }

        const com_id = job.new_user_id;

        // Lưu vào bảng ứng tuyển
        const itemMax = await applyForJob.findOne({}, { nhs_id: 1 }).sort({ nhs_id: -1 }).limit(1).lean(),
            item = new applyForJob({
                nhs_id: Number(itemMax.nhs_id) + 1,
                nhs_use_id: use_id,
                nhs_new_id: new_id,
                nhs_com_id: com_id,
                nhs_time: now,
                check_ut: 14,
                nhs_xn_uts: nhs_xn_uts
            });
        await item.save();

        // Cập nhật thời gian làm mới cho ứng viên
        await Candidate.updateOne({ _id: use_id }, {
            $set: {
                updatedAt: now
            }
        });

        // +10 điểm cho tin tuyển dụng khi được ứng tuyển
        NewTV365.updateOne({ new_id: new_id }, { $inc: { new_point: 10 } });

        // Lưu vào lịch sử
        const point = 10,
            type = 1;
        await serviceNew365.logHistoryNewPoint(new_id, point, type);

        // Thêm vào thông báo tại quả chuông
        const itemMaxNoti = await Notification.findOne({}, { not_id: 1 }).sort({ not_id: -1 }).limit(1).lean(),
            itemNoti = new Notification({
                not_id: Number(itemMax.nhs_id) + 1,
                usc_id: com_id,
                not_time: now,
                new_id: new_id,
                not_active: 1,
            });
        await itemNoti.save();

        // Thêm vào bảng sử dụng điểm
        const itemPointUsed = new pointUsed({
            usc_id: com_id,
            use_id: use_id,
            point: 1,
            type: 1,
            used_day: now,
        });
        await itemPointUsed.save();

        return true;
    }
    return false;
}