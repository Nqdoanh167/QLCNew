const functions = require("../../../services/functions")
const feedback = require("../../../models/qlc/Feedback_emp")
const user = require("../../../models/Users")
const md5 = require('md5');

//cai dat dich vu Vip
exports.setVip = async(req, res) => {
    try {
        let com_ep_vip = req.body.com_ep_vip
        let com_vip_time = req.body.com_vip_time
        let com_id = req.body.com_id
        let now = new Date()
        let inpput = new Date(com_vip_time)
            // console.log(Date.parse(com_vip_time))
        if (!com_id) {
            functions.setError(res, "vui lòng nhập id công ty")
        } else if (com_ep_vip < 5) {
            await functions.setError(res, "số lượng nhân viên được đăng kí vip không được dưới 5")
        } else if (isNaN(com_ep_vip)) {
            functions.setError(res, "số lượng nhân viên phải là số")
        } else if (Date.parse(now) > Date.parse(inpput)) {
            await functions.setError(res, "số ngày nhập phải lớn hơn hiện tại ")
        } else {
            let find = await user.findOne({ idQLC: com_id, type: 1 }).lean()
            if (!find) {
                await functions.setError(res, " không tìm thấy công ty ")
            } else {
                let data = await user.updateOne({ idQLC: com_id, type: 1 }, {
                    $set: {
                        'inForCompany.cds.com_vip': 1,
                        'inForCompany.cds.com_ep_vip': com_ep_vip,
                        'inForCompany.cds.com_vip_time': Date.parse(inpput),
                    }
                })
                await functions.success(res, "cập nhật thành công ", { data })
            }
        }
    } catch (e) {
        functions.setError(res, e.message)
    }
}

// lay danh sach KH
exports.getList = async(req, res) => {

    try {
        const pageNumber = req.body.pageNumber || 1;
        const request = req.body;

        let fromWeb = request.fromWeb
        inputNew = request.inputNew
        inputOld = request.inputOld
        find = request.find
        findConditions = request.findConditions

        let type = 1
        let data = [];
        let listCondition = {};
        let checkNew1 = new Date(inputNew)
        let checkNew = Date.parse(checkNew1)
        let checkOld1 = new Date(inputOld)
        let checkOld = Date.parse(checkOld1)

        const currentDate = new Date();
        const previousDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
        const inDay1 = new Date(previousDate)
        const inDay = Date.parse(inDay1)

        if (checkOld > checkNew) {
            await functions.setError(res, "thời gian nhập không đúng quy định")
        }
        //tìm kiếm qua trang web
        if (fromWeb) listCondition.fromWeb = fromWeb;

        if (inputNew || inputOld) listCondition['createdAt'] = { $gte: checkOld, $lte: checkNew };

        if (find) listCondition["userName"] = { $regex: find };

        if (type) listCondition.type = type;
        //tiìm kiếm công ty đang vip thì cho vip = 1 
        if (findConditions == 1) listCondition['inForCompany.cds.com_vip'] = 1;
        //tìm kiếm công ty từng vip thì cho time vip != 0
        if (findConditions == 2) listCondition['inForCompany.cds.com_vip_time'] = { $ne: 0 };
        //tìm kiếm công ty chưa vip thì cho vip = 0 va time vip = 0
        if (findConditions == 3) listCondition['inForCompany.cds.com_vip'] = 0, listCondition['inForCompany.cds.com_vip_time'] = 0;
        //danh sach cty dang ki loi , chua kich hoat
        if (findConditions == 4) listCondition["authentic"] = 0;
        //danah sach cong ty ddang ki trong ngay
        if (findConditions == 5) listCondition['createdAt'] = { $gte: inDay }
            //danh sach cong ty su dung cham cong trong ngay
        if (findConditions == 6) listCondition['inForCompany.cds.type_timekeeping'] = { $ne: 0 }, listCondition['createdAt'] = { $gte: inDay }



        data = await user.find(listCondition).select('com_id userName Email phoneTK address fromWeb createdAt status_com authentic inForCompany.cds.com_vip inForCompany.cds.com_ep_vip inForCompany.cds.com_vip_time ').skip((pageNumber - 1) * 25).limit(25).sort({ _id: -1 });
        if (data === []) {
            await functions.setError(res, 'Không có dữ liệu', 404);

        } else {
            let count = await user.countDocuments(listCondition)

            return functions.success(res, 'Lấy thành công', { data, count });
        }
    } catch (err) {
        return functions.setError(res, err.message);
    };


}

exports.updatePassword = async(req, res, next) => {
    try {
        let password = req.body.password;
        let com_id = req.body.com_id;
        if (password && com_id) {
            let checkPassword = await functions.verifyPassword(password)
            if (checkPassword) {
                return functions.setError(res, "sai dinh dang Mk", 404)
            }
            if (password.length < 6) {
                return functions.setError(res, 'Password quá ngắn', 400)
            }
            let find = await user.findOne({ idQLC: com_id, type: 1 }).lean()
            if (!find) {
                await functions.setError(res, " không tìm thấy công ty ")
            } else {
                await user.updateOne({ idQLC: com_id, type: 1 }, {
                    $set: {
                        password: md5(password),
                    }
                });
                return functions.success(res, 'cập nhập thành công')
            }

        } else {
            return functions.setError(res, "nhập thiếu thông tin", 404)

        }


    } catch (error) {
        return functions.setError(res, error)
    }
}

exports.getListFeedback = async(req, res) => {
    try {
        const pageNumber = req.body.pageNumber || 1;
        const request = req.body;
        let data = [];

        data = await feedback.find({}).select('name cus_id email phone_number feed_back rating createdAt app_name from_source').skip((pageNumber - 1) * 25).limit(25).sort({ _id: -1 }).lean();
        if (data === []) {
            await functions.setError(res, 'Không có dữ liệu', 404);

        } else {
            let count = await feedback.countDocuments({})

            return functions.success(res, 'Lấy thành công', { data, count });
        }


    } catch (e) {
        return functions.setError(res, e.message)
    }

}