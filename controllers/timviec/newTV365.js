const axios = require('axios');
const functions = require('../../services/functions');
const City = require('../../models/City');
const District = require('../../models/District');
const NewTV365 = require('../../models/Timviec365/UserOnSite/Company/New');
const Users = require('../../models/Users');
const ApplyForJob = require('../../models/Timviec365/UserOnSite/Candicate/ApplyForJob');
const UserSavePost = require('../../models/Timviec365/UserOnSite/Candicate/UserSavePost');
const CommentPost = require('../../models/Timviec365/UserOnSite/CommentPost');
const LikePost = require('../../models/Timviec365/UserOnSite/LikePost');
const Keyword = require('../../models/Timviec365/UserOnSite/Company/Keywords');
const Blog = require('../../models/Timviec365/Blog/Posts');
const Category = require('../../models/Timviec365/CategoryJob');
const SaveVote = require('../../models/Timviec365/SaveVote');
const TblHistoryViewed = require('../../models/Timviec365/UserOnSite/Candicate/TblHistoryViewed');
const Profile = require('../../models/Timviec365/UserOnSite/Candicate/Profile');
const HistoryNewPoint = require('../../models/Timviec365/HistoryNewPoint');
const PermissionNotify = require('../../models/Timviec365/PermissionNotify');

const CategoryDes = require('../../models/Timviec365/CategoryDes');
const TblModules = require('../../models/Timviec365/TblModules');
const slugify = require('slugify');

// Service
const service = require('../../services/timviec365/new');
const serviceCompany = require('../../services/timviec365/company')

// đăng tin
exports.postNewTv365 = async(req, res, next) => {
    try {
        let company = req.user.data,
            idCompany = company.idTimViec365,
            request = req.body,
            new_title = request.new_title,
            new_cat_id = request.new_cat_id,
            new_so_luong = request.new_so_luong,
            new_cap_bac = request.new_cap_bac,
            new_hinh_thuc = request.new_hinh_thuc,
            new_city = request.new_city,
            new_qh = request.new_qh,
            new_addr = request.new_addr,
            new_money_unit = request.new_money_unit,
            new_hoahong = request.new_hoahong,
            new_money = request.new_money,
            new_tgtv = request.new_tgtv,
            new_money_type = request.new_money_type,
            new_money_max = request.new_money_max,
            new_money_min = request.new_money_min,
            new_mota = request.new_mota,
            new_yeucau = request.new_yeucau,
            new_exp = request.new_exp,
            new_bang_cap = request.new_bang_cap,
            new_gioi_tinh = request.new_gioi_tinh,
            new_quyenloi = request.new_quyenloi,
            new_ho_so = request.new_hoso,
            new_han_nop = request.new_han_nop,
            usc_name = request.usc_name,
            usc_name_add = request.usc_name_add,
            usc_name_phone = request.usc_name_phone,
            usc_name_email = request.usc_name_email,
            linkVideo = req.linkVideo,
            now = functions.getTimeNow(),
            video = '',
            link = '',
            // mảng chứa danh sách ảnh của tin
            listImg = [];

        if (new_title && new_cat_id && new_so_luong && new_cap_bac && new_hinh_thuc && new_city && new_qh && new_addr &&
            new_money_unit && new_mota && new_yeucau && new_exp && new_bang_cap && new_gioi_tinh && new_quyenloi && new_han_nop && usc_name &&
            usc_name_add && usc_name_phone && usc_name_email && new_money_type) {
            // Check trùng tiêu đề
            if (!await service.checkExistTitle(idCompany, new_title)) {
                return functions.setError(res, 'Tiêu đề đã tồn tại', 500);
            }

            // Check ký tự đặc biệt trong tiêu đề
            if (await service.checkSpecalCharacter(new_title)) {
                return functions.setError(res, 'Tiêu đề không cho phép chứa ký tự đặc biệt', 500);
            }

            // Check từ khóa nằm trong tiêu đề
            if (!await service.foundKeywordHot(new_title)) {
                return functions.setError(res, "Tiêu đề tin không được chứa các từ Hot, tuyển gấp, cần gấp, lương cao", 500);
            }

            // Check thời gian hạn nộp
            if (!await functions.checkTime(new_han_nop)) {
                return functions.setError(res, 'thời gian hạn nộp phải lớn hơn thời gian hiện tại', 500)
            }

            // Check định dạng sđt và email
            if (!await functions.checkEmail(usc_name_email) || !await functions.checkPhoneNumber(usc_name_phone)) {
                return functions.setError(res, 'Email hoặc Số điện thoại không đúng định dạng', 500)
            }

            // Xử lý giá trị của mức lương qua loại lương
            const getMoney = service.getMoney(new_money_type, new_money, new_money_max, new_money_min),
                money = getMoney.money,
                maxValue = getMoney.maxValue,
                minValue = getMoney.minValue;

            // Lấy tag
            const takeData = await service.recognition_tag_tin(new_cat_id, new_title, new_mota, new_yeucau),
                new_lv = takeData.length > 0 ? takeData[0].name_tag : null;

            // Xử lý data
            const newMax = await NewTV365.findOne({}, { new_id: 1 }).sort({ new_id: -1 }).limit(1).lean();

            // Xử lý alias
            const new_alias = slugify(new_title, {
                replacement: '-', // Ký tự thay thế khoảng trắng và các ký tự đặc biệt
                lower: true, // Chuyển thành chữ thường
                strict: true // Loại bỏ các ký tự không hợp lệ
            });
            const new_id = Number(newMax.new_id) + 1;
            const newTV = new NewTV365({
                new_id: new_id,
                new_title: new_title,
                new_user_id: idCompany,
                new_alias: new_alias,
                new_cat_id: [new_cat_id],
                new_city: [new_city],
                new_qh_id: [new_qh],
                new_addr: new_addr,
                new_money: new_money,
                new_cap_bac: new_cap_bac,
                new_exp: new_exp,
                new_gioi_tinh: new_gioi_tinh,
                new_bang_cap: new_bang_cap,
                new_so_luong: new_so_luong,
                new_hinh_thuc: new_hinh_thuc,
                new_create_time: now,
                new_update_time: now,
                new_active: 1,
                new_han_nop: new_han_nop,
                new_mota: new_mota,
                new_yeucau: new_yeucau,
                new_quyenloi: new_quyenloi,
                new_ho_so: new_ho_so,
                new_hoahong: new_hoahong,
                new_tgtv: new_tgtv,
                new_lv: new_lv,
                nm_type: new_money_type,
                nm_min_value: new_money_min,
                nm_max_value: new_money_max,
                nm_unit: new_money_unit,
            });
            await newTV.save();
            await Users.updateOne({ idTimViec365: idCompany, type: 1 }, {
                $set: {
                    'inForCompany.timviec365.usc_name': usc_name,
                    'inForCompany.timviec365.usc_name_add': usc_name_add,
                    'inForCompany.timviec365.usc_name_phone': usc_name_phone,
                    'inForCompany.timviec365.usc_name_email': usc_name_email,
                    'inForCompany.timviec365.usc_update_new': now,
                }
            });

            if (JSON.stringify(req.files) !== '{}') {
                // Xử lý hình ảnh vào kho
                const storage = req.files.storage;
                let uploadStorage, isUploadLogo = 0;
                let list_image = [],
                    list_video = [];
                for (let index = 0; index < storage.length; index++) {
                    const file = storage[index];
                    if (serviceCompany.checkItemStorage(file.type)) {
                        if (serviceCompany.isImage(file.type)) {
                            uploadStorage = serviceCompany.uploadStorage(idCompany, file, 'image', company.createdAt);
                            await serviceCompany.addStorage(idCompany, 'image', uploadStorage.file_name);
                            list_image.push(uploadStorage.file_name);
                        } else {
                            uploadStorage = serviceCompany.uploadStorage(idCompany, file, 'video', company.createdAt);
                            await serviceCompany.addStorage(idCompany, 'video', uploadStorage.file_name);
                            list_video.push(uploadStorage.file_name);
                        }
                    }
                }
                // Cập nhật vào base
                await NewTV365.updateOne({ new_id: new_id }, {
                    $set: {
                        new_images: list_image.toString(),
                        new_video: list_video.toString()
                    }
                });
            }

            return functions.success(res, "tạo bài tuyển dụng thành công");
        }
        return functions.setError(res, 'thiếu dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// lấy 1 bài post 
exports.getPost = async(req, res, next) => {
    try {
        let new_id = req.body.new_id;
        if (new_id) {
            let post = await functions.getDatafindOne(NewTV365, { new_id: new_id })
            if (post) {
                return functions.success(res, "Lấy dữ liệu thành công", { post })
            }
            return functions.setError(res, 'Tin không tồn tại', 404)
        }
        return functions.setError(res, 'Chưa truyền id tin', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// check 10p đăng tin 1 lần
exports.checkPostNew10p = async(req, res, next) => {
    try {
        let id = req.user.data.idTimViec365;
        let post = await NewTV365.findOne({ userID: id }).sort({ id: -1 });
        if (post) {
            let checkPost = await functions.isCurrentTimeGreaterThanInputTime(post.createTime);
            if (checkPost) {
                return functions.success(res, "Bạn vừa đăng tin cách đây 10p")
            }
            return functions.setError(res, 'chưa đủ 10p', 404)
        }
        return functions.setError(res, 'không có dữ liệu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// api lấy tổng số tin theo thời gian
exports.getCountByTime = async(req, res) => {
    try {
        const user = req.user.data,
            time_begin = req.body.time_begin,
            time_end = req.body.time_end;

        if (time_begin && time_end && !isNaN(time_begin) && !isNaN(time_end)) {
            const count = await NewTV365.countDocuments({
                new_user_id: user.idTimViec365,
                new_create_time: { $gt: time_begin },
                new_create_time: { $lt: time_end },
            });
            return functions.success(res, "Số lượng tin đăng trong ngày", { count });
        }
        return functions.setError(res, "Chưa truyền giá trị thời gian");
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

exports.getNewCreateTime = async(req, res) => {
    try {
        const user = req.user.data,
            userID = user.idTimViec365;

        let lastdt = 0; // Đéo biết là gì đâu nhưng thấy bên php như nào thì bếch sang
        if (userID == 143879) {
            const count = await NewTV365.countDocuments({ new_user_id: userID, new_create_time: { $gt: 1669889469 } });
            if (count >= 100) {
                lastdt = 1;
            }
        } else {
            // mdt = mức đăng tin
            const mdt = await NewTV365.findOne({ new_user_id: userID, })
                .select('new_create_time')
                .sort({ new_create_time: -1 })
                .limit(1)
                .lean(),
                now = functions.getTimeNow();
            if (mdt > now - 600) {
                lastdt = 1;
            }
        }
        return functions.success(res, "....", { lastdt });

    } catch (error) {
        console.log(error);
        return functions.setError(res, error);
    }
}

exports.getListTitleNew = async(req, res) => {
    try {
        const user = req.user.data,
            userID = user.idTimViec365;

        const list = await NewTV365.find({ new_user_id: userID }).select('new_title').lean();
        return functions.success(res, "....", { list });

    } catch (error) {
        console.log(error);
        return functions.setError(res, error);
    }
}

exports.getListPermision = async(req, res) => {
    try {
        const user = req.user.data,
            userID = user.idTimViec365;

        const list = await NewTV365.find({ new_user_id: userID }).select('new_title').lean();
        return functions.success(res, "....", { list });

    } catch (error) {
        console.log(error);
        return functions.setError(res, error);
    }
}

// cập nhập tin tuyển dụng
exports.updateNewTv365 = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365,
            request = req.body,
            new_title = request.new_title,
            new_id = Number(request.new_id),
            new_cat_id = request.new_cat_id,
            new_so_luong = request.new_so_luong,
            new_cap_bac = request.new_cap_bac,
            new_hinh_thuc = request.new_hinh_thuc,
            new_city = request.new_city,
            new_qh = request.new_qh,
            new_addr = request.new_addr,
            new_money_unit = request.new_money_unit,
            new_hoahong = request.new_hoahong,
            new_money = request.new_money,
            new_tgtv = request.new_tgtv,
            new_money_type = request.new_money_type,
            new_money_max = request.new_money_max,
            new_money_min = request.new_money_min,
            new_mota = request.new_mota,
            new_yeucau = request.new_yeucau,
            new_exp = request.new_exp,
            new_bang_cap = request.new_bang_cap,
            new_gioi_tinh = request.new_gioi_tinh,
            new_quyenloi = request.new_quyenloi,
            new_ho_so = request.new_ho_so,
            new_han_nop = request.new_han_nop,
            usc_name = request.usc_name,
            usc_name_add = request.usc_name_add,
            usc_name_phone = request.usc_name_phone,
            usc_name_email = request.usc_name_email,
            linkVideo = req.linkVideo,
            // videoType = req.files.videoType,
            new_lv,
            video = '',
            link = '',
            // mảng chứa danh sách ảnh của tin
            listImg = [];

        if (new_title && new_cat_id && new_so_luong && new_cap_bac && new_hinh_thuc && new_city && new_qh && new_addr &&
            new_money_unit && new_mota && new_yeucau && new_exp && new_bang_cap && new_gioi_tinh && new_quyenloi && new_han_nop && usc_name &&
            usc_name_add && usc_name_phone && usc_name_email && new_money_type && new_id) {

            if (!await service.checkExistTitle(idCompany, new_title, new_id)) {
                return functions.setError(res, 'Tiêu đề đã tồn tại', 500);
            }

            if (await service.checkSpecalCharacter(new_title)) {
                return functions.setError(res, 'Tiêu đề không cho phép chứa ký tự đặc biệt', 500);
            }

            if (!await service.foundKeywordHot(new_title)) {
                return functions.setError(res, "Tiêu đề tin không dược chứa các từ Hot, tuyển gấp, cần gấp, lương cao", 500);
            }

            if (!await functions.checkTime(new_han_nop)) {
                return functions.setError(res, 'thời gian hạn nộp phải lớn hơn thời gian hiện tại', 500);
            }

            if (!await functions.checkEmail(usc_name_email) || !await functions.checkPhoneNumber(usc_name_phone)) {
                return functions.setError(res, 'Email hoặc Số điện thoại không đúng định dạng', 500);
            }

            // Xử lý giá trị của mức lương qua loại lương
            const getMoney = service.getMoney(new_money_type, new_money, new_money_max, new_money_min);
            new_money = getMoney.money;
            new_money_max = getMoney.maxValue;
            new_money_min = getMoney.minValue;

            // Lấy tag
            let takeData = await service.recognition_tag_tin(new_cat_id, new_title, new_mota, new_yeucau);
            lv = takeData.length > 0 ? takeData.id_tag : null;

            await NewTV365.updateOne({ new_id: new_id }, {
                $set: {
                    new_title: new_title,
                    new_cat_id: [new_cat_id],
                    new_city: [new_city],
                    new_qh_id: [new_qh],
                    new_addr: new_addr,
                    new_money: new_money,
                    new_cap_bac: new_cap_bac,
                    new_exp: new_exp,
                    new_gioi_tinh: new_gioi_tinh,
                    new_bang_cap: new_bang_cap,
                    new_so_luong: new_so_luong,
                    new_hinh_thuc: new_hinh_thuc,
                    new_update_time: functions.getTimeNow(),
                    new_han_nop: new_han_nop,
                    new_mota: new_mota,
                    new_yeucau: new_yeucau,
                    new_quyenloi: new_quyenloi,
                    new_ho_so: new_ho_so,
                    new_hoahong: new_hoahong,
                    new_tgtv: new_tgtv,
                    new_lv: new_lv,
                    nm_type: new_money_type,
                    nm_min_value: new_money_min,
                    nm_max_value: new_money_max,
                    nm_unit: new_money_unit
                }
            });
            await Users.updateOne({ idTimViec365: idCompany, type: 1 }, {
                $set: {
                    'inForCompany.timviec365.usc_name': usc_name,
                    'inForCompany.timviec365.usc_name_add': usc_name_add,
                    'inForCompany.timviec365.usc_name_phone': usc_name_phone,
                    'inForCompany.timviec365.usc_name_email': usc_name_email,
                    'inForCompany.timviec365.usc_update_new': functions.getTimeNow(),
                }
            });
            return functions.success(res, "cập nhập bài tuyển dụng thành công")
        }
        return functions.setError(res, 'thiếu dữ liệu', 404)
    } catch (error) {
        console.log(error)
        if (req.files.avatarUser) {
            req.files.avatarUser.forEach(async(element) => {
                await functions.deleteImg(element)
            })
        }
        if (req.files.videoType) {
            await functions.deleteImg(req.files.videoType[0])
        }
        return functions.setError(res, error)
    }
}

// hàm xóa tin
exports.deleteNewTv365 = async(req, res, next) => {
    try {
        let idNew = req.params.idNew;
        if (idNew) {
            await functions.getDataDeleteOne(NewTV365, { _id: idNew })
            return functions.success(res, "xóa bài tuyển dụng thành công")
        }
        return functions.setError(res, 'thiếu dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm làm mới tin
exports.refreshNew = async(req, res, next) => {
    try {
        let idNew = req.body.new_id;
        if (idNew) {
            await NewTV365.updateOne({ _id: idNew }, {
                $set: { updateTime: new Date.getTime() }
            });
            return functions.success(res, "làm mới bài tuyển dụng thành công")
        }
        return functions.setError(res, 'thiếu dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

//trang chủ timviec
exports.homePage = async(req, res, next) => {
    try {
        let pageSizeHD = Number(req.body.pageSizeHD) || 30;
        let pageSizeTH = Number(req.body.pageSizeTH) || 30;
        let pageSizeTG = Number(req.body.pageSizeTG) || 30;
        let now = new Date().getTime() / 1000;
        let listsHot = [],
            listsGap = [],
            listsTH = [];
        const project = {
            _id: 0,
            new_id: 1,
            new_title: 1,
            new_han_nop: 1,
            new_do: 1,
            new_ghim: 1,
            new_thuc: 1,
            new_alias: 1,
            new_active: 1,
            new_money: 1,
            new_hinh_thuc: 1,
            new_city: 1,
            new_create_time: 1,
            nm_id: 1,
            nm_type: 1,
            nm_min_value: 1,
            nm_max_value: 1,
            nm_unit: 1,
            new_badge: 1,
            usc_id: "$user.idTimViec365",
            usc_company: "$user.userName",
            usc_alias: "$user.alias",
            chat365_id: "$user._id",
            usc_time_login: "$user.time_login",
            usc_create_time: "$user.createdAt",
            usc_logo: "$user.avatarUser",
            isOnline: "$user.isOnline"
        }
        let listPostVLHD = await NewTV365.aggregate([{
                $match: {
                    new_cao: 0,
                    new_gap: 0,
                    new_han_nop: { $gt: now }
                }
            }, {
                $sort: {
                    new_hot: -1,
                    new_update_time: -1
                }
            },
            {
                $skip: 0
            },
            {
                $limit: Number(pageSizeHD)
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "new_user_id",
                    foreignField: "idTimViec365",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    "user.type": 1
                }
            },
            {
                $project: project
            },
        ]);

        for (let i = 0; i < listPostVLHD.length; i++) {
            let element = listPostVLHD[i];
            let avatarUser = await functions.getUrlLogoCompany(element.usc_create_time, element.usc_logo);
            element.usc_logo = avatarUser;
        }

        let listPostVLTH = [],
            listPostVLTG = [];
        listPostVLTH = await NewTV365.aggregate([{
                $match: {
                    new_hot: 0,
                    new_gap: 0,
                    new_han_nop: { $gt: now }
                }
            }, {
                $sort: {
                    new_cao: -1,
                    new_update_time: -1
                }
            },
            {
                $skip: 0
            },
            {
                $limit: Number(pageSizeTH)
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "new_user_id",
                    foreignField: "idTimViec365",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    "user.type": 1
                }
            },
            {
                $project: project
            }
        ]);

        for (let i = 0; i < listPostVLTH.length; i++) {
            let element = listPostVLTH[i];
            let avatarUser = await functions.getUrlLogoCompany(element.usc_create_time, element.usc_logo);
            element.usc_logo = avatarUser;
        }

        listPostVLTG = await NewTV365.aggregate([{
                $match: {
                    new_cao: 0,
                    new_hot: 0,
                    new_han_nop: { $gt: now }
                }
            }, {
                $sort: {
                    new_gap: -1,
                    new_update_time: -1
                }
            },
            {
                $skip: 0
            },
            {
                $limit: Number(pageSizeTG)
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "new_user_id",
                    foreignField: "idTimViec365",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    "user.type": 1
                }
            },
            {
                $project: project
            }

        ]);

        for (let i = 0; i < listPostVLTG.length; i++) {
            let element = listPostVLTG[i];
            let avatarUser = await functions.getUrlLogoCompany(element.usc_create_time, element.usc_logo);
            element.usc_logo = avatarUser;
        }

        // let newAI = []

        // let candiCateID = req.body.candiCateID

        // let takeData = await axios({
        //     method: "post",
        //     url: "http://43.239.223.10:4001/recommendation_tin_ungvien",
        //     data: {
        //         site_job: "timviec365",
        //         site_uv: "uvtimviec365",
        //         new_id: candiCateID,
        //         size: 20,
        //         pagination: 1,
        //     },
        //     headers: { "Content-Type": "multipart/form-data" }
        // });
        // let listNewId = takeData.data.data.list_id.split(",")
        // for (let i = 0; i < listNewId.length; i++) {
        //     listNewId[i] = Number(listNewId[i])
        // }

        // let findNew = await functions.getDatafind(NewTV365, { _id: { $in: listNewId } })
        // for (let i = 0; i < findNew.length; i++) {
        //     newAI.push(findNew[i])
        // }

        // Lấy bài viết chân trang
        const dataSeo = await TblModules.findOne({
            module: "https://timviec365.vn/"
        }).lean();

        return functions.success(res, "Lấy danh sách tin đăng thành công", { VLHD: listPostVLHD, VLTH: listPostVLTH, VLTG: listPostVLTG, dataSeo });
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// Tìm kiếm việc làm
exports.listJobBySearch = async(req, res, next) => {
    try {
        const request = req.body;
        let page = request.page || 1,
            pageSize = request.pageSize || 30,
            cate_id = Number(request.cate_id) || 0,
            city = Number(request.city) || 0,
            now = functions.getTimeNow(),
            type = request.type,
            list_id = request.list_id || null;

        const skip = (page - 1) * pageSize;
        let condition = {
                new_han_nop: { $gt: now }
            },
            sort = {
                new_hot: -1,
                new_cao: -1,
                new_gap: -1,
                new_nganh: -1,
                new_update_time: -1
            };;
        // Tìm kiếm việc làm theo ngành nghề
        if (cate_id != 0) {
            condition.new_cat_id = { $all: [cate_id] };
        }
        // Tìm kiếm việc làm theo tỉnh thành
        if (city != 0) {
            condition.new_city = { $all: [city] };
        }

        if (list_id != null) {
            condition = {
                new_id: {
                    $in: list_id.split(',').map(Number)
                }
            };
        }

        // Sắp xếp theo tin mới nhất
        if (type != undefined && type == "new") {
            sort = {
                new_update_time: -1
            };
        }
        // Sắp xếp theo mức lương
        else if (type != undefined && type == "money") {
            sort = {
                new_money: -1
            };
        }

        listJobNew = await NewTV365.aggregate([{
                $match: condition
            },
            {
                $sort: sort
            },
            {
                $skip: skip
            },
            {
                $limit: Number(pageSize)
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "new_user_id",
                    foreignField: "idTimViec365",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    "user.type": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    new_id: 1,
                    new_title: 1,
                    new_money: 1,
                    new_city: 1,
                    new_cat_id: 1,
                    new_create_time: 1,
                    new_update_time: 1,
                    new_view_count: 1,
                    new_alias: 1,
                    new_ghim: 1,
                    new_hot: 1,
                    new_cao: 1,
                    new_gap: 1,
                    new_nganh: 1,
                    new_active: 1,
                    new_han_nop: 1,
                    new_yeucau: 1,
                    new_quyenloi: 1,
                    new_bang_cap: 1,
                    nm_type: 1,
                    nm_min_value: 1,
                    nm_max_value: 1,
                    nm_unit: 1,
                    nm_id: 1,
                    usc_id: "$user.idTimViec365",
                    usc_create_time: "$user.createdAt",
                    usc_company: "$user.userName",
                    usc_alias: "$user.alias",
                    usc_logo: "$user.avatarUser",
                    usc_time_login: "$user.time_login",
                    chat365_secret: "$user.chat365_secret",
                    chat365_id: "$user._id",
                    isOnline: "$user.isOnline",
                    saved: "",
                    applied: "",
                    views: "",
                    new_badge: 1
                }
            }

        ]);
        // Kiểm tra xem có đăng nhập hay không
        const user = await functions.getTokenUser(req, res, next);

        for (let i = 0; i < listJobNew.length; i++) {
            const element = listJobNew[i];
            let avatarUser = await functions.getUrlLogoCompany(element.usc_create_time, element.usc_logo);
            element.usc_logo = avatarUser;
            element.new_city = element.new_city.toString();
            element.new_cat_id = element.new_cat_id.toString();


            // Lấy danh sách thả cảm xúc
            let ListLikePost = await LikePost.aggregate([{
                    $match: {
                        lk_new_id: Number(element.new_id),
                        lk_type: { $ne: 8 },
                        lk_for_comment: 0
                    }
                },
                {
                    $lookup: {
                        from: "Users",
                        localField: "lk_user_idchat",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $skip: 0
                },
                {
                    $project: {
                        lk_id: 1,
                        lk_type: 1,
                        lk_for_comment: 1,
                        lk_user_name: "$user.userName",
                        lk_user_avatar: "$user.avatarUser",
                        lk_user_idchat: "$user._id"
                    }
                },
            ]);
            element.arr_likes_new = ListLikePost;
            // lấy danh sách chia sẻ
            const ListSharePost = await LikePost.aggregate([{
                    $match: {
                        lk_new_id: Number(element.new_id),
                        lk_type: { $eq: 8 },
                        lk_for_comment: 0
                    }
                },
                {
                    $lookup: {
                        from: "Users",
                        localField: "lk_user_idchat",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $skip: 0
                },
                {
                    $project: {
                        lk_id: 1,
                        lk_type: 1,
                        lk_for_comment: 1,
                        lk_user_name: "$user.userName",
                        lk_user_avatar: "$user.avatarUser",
                        lk_user_idchat: "$user._id"
                    }
                },
            ]);
            element.arr_share_new = ListSharePost;

            // lấy tổng số bình luận
            element.count_comments = await CommentPost.countDocuments({ cm_parent_id: 0, cm_new_id: Number(element.new_id) });
            // Lấy huy hiệu tia sét
            element.badge = await NewTV365.countDocuments({ new_user_id: element.new_user_id, new_badge: 1 });
            // lấy danh sách bình luận
            element.arr_comments = await CommentPost.distinct('cm_sender_idcha cm_sender_name', { cm_new_id: Number(element.new_id), cm_parent_id: 0 });
            if (user) {
                let checkNopHoSo = await functions.getDatafindOne(ApplyForJob, { nhs_new_id: element.new_id, nhs_use_id: user.idTimViec365 })
                if (checkNopHoSo) {
                    element.applied = true
                }
            }
        }
        const total = await functions.findCount(NewTV365, condition);

        // Lấy bài viết chân trang
        const footerNew = await CategoryDes.findOne({
            cate_id: cate_id,
            city_id: city
        }, "cate_h1 cate_tt cate_tt1 cate_descri cate_tdgy cate_ndgy cate_des").lean();

        if (footerNew && footerNew.cate_des != "") {
            footerNew.cate_des = functions.renderCDNImage(footerNew.cate_des);
        }

        // // Chức danh
        let conditionChucDanh = [{
                $or: [
                    { key_name: { $regex: /thực tập/i } },
                    { key_name: { $regex: /nhân viên/i } },
                    { key_name: { $regex: /chuyên viên/i } },
                    { key_name: { $regex: /trưởng phòng/i } },
                    { key_name: { $regex: /trưởng nhóm/i } },
                    { key_name: { $regex: /trợ lý/i } },
                    { key_name: { $regex: /phó trưởng phòng/i } },
                    { key_name: { $regex: /phó giám đốc/i } },
                    { key_name: { $regex: /giám đốc/i } },
                    { key_name: { $regex: /quản lý/i } },
                    { key_name: { $regex: /quản đốc/i } },
                    { key_cb_id: { $ne: 0 } }
                ]
            },
            { key_301: "" },
        ];

        if (cate_id != 0) {
            conditionChucDanh = [...conditionChucDanh, {
                key_cate_lq: cate_id
            }]
        }
        if (city != 0) {
            conditionChucDanh = [...conditionChucDanh, {
                key_city_id: city
            }]
        }

        const listChucDanh = await Keyword.aggregate([{
                $match: {
                    $and: conditionChucDanh
                }
            },
            { $limit: 20 },
            {
                $project: {
                    _id: 0,
                    key_id: "$_id",
                    key_cate_id: 1,
                    key_city_id: 1,
                    key_qh_id: 1,
                    key_name: 1,
                    key_cb_id: 1,
                    key_type: 1
                }
            }
        ]);

        // Từ khóa liên quan (wordReacted)
        let listWordReacted = [];
        if (cate_id != 0) {
            listWordReacted = await Keyword.aggregate([{
                    $match: {
                        key_name: { $ne: '' },
                        key_301: '',
                        key_cb_id: 0,
                        key_city_id: city,
                        key_name: { $not: /thực tập|chuyên viên|nhân viên|giám đốc|trưởng phòng|trưởng nhóm|trợ lý|phó trưởng phòng|phó giám đốc|quản lý|quản đốc/ },
                        key_cate_lq: cate_id
                    }
                },
                { $limit: 20 },
                {
                    $project: {
                        _id: 0,
                        key_id: "$_id",
                        key_cate_id: 1,
                        key_city_id: 1,
                        key_qh_id: 1,
                        key_name: 1,
                        key_cb_id: 1,
                        key_type: 1
                    }
                }
            ]);
        }

        // Địa điểm (city)
        let listCityReated = [];
        if (city != 0 || cate_id != 0) {
            let conditionCityReated = {
                key_301: '',
                key_cb_id: 0,
                key_cate_id: 0,
            };
            if (cate_id != 0 && request.cate_name) {
                const cate_name = request.cate_name;
                conditionCityReated.key_city_id = { $ne: 0 };
                conditionCityReated.key_name = { $regex: cate_name };
            }
            if (city != 0) {
                conditionCityReated.key_name = '';
                conditionCityReated.key_qh_id = { $ne: 0 };
                conditionCityReated.key_city_id = city;
            }

            listCityReated = await Keyword.aggregate([{
                    $match: conditionCityReated
                },
                {
                    $project: {
                        _id: 0,
                        key_id: "$_id",
                        key_cate_id: 1,
                        key_city_id: 1,
                        key_qh_id: 1,
                        key_name: 1,
                        key_cb_id: 1,
                        key_type: 1
                    }
                }
            ]);
        }
        return functions.success(res, "Lấy danh sách tin đăng thành công", { items: listJobNew, total, footerNew, listChucDanh, listWordReacted, listCityReated });
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// chi tiết tin tuyển dụng
exports.detail = async(req, res, next) => {
    try {
        let newID = req.body.new_id;
        let statusApply = false;
        let statusSavePost = false;

        if (newID) {
            let result = await NewTV365.aggregate([{
                    $match: {
                        new_id: Number(newID),
                    }
                },
                {
                    $lookup: {
                        from: "Users",
                        localField: "new_user_id",
                        foreignField: "idTimViec365",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $match: {
                        "user.type": 1
                    }
                },
                {
                    $skip: 0
                },
                { $limit: 1 },
                {
                    $project: {
                        _id: 0,
                        new_id: 1,
                        new_title: 1,
                        new_alias: 1,
                        new_cat_id: 1,
                        new_lv: 1,
                        new_addr: 1,
                        new_city: 1,
                        new_qh_id: 1,
                        new_user_id: 1,
                        new_money: 1,
                        new_cap_bac: 1,
                        new_exp: 1,
                        new_bang_cap: 1,
                        new_gioi_tinh: 1,
                        new_so_luong: 1,
                        new_hinh_thuc: 1,
                        new_create_time: 1,
                        new_update_time: 1,
                        new_view_count: 1,
                        new_han_nop: 1,
                        new_hot: 1,
                        new_tgtv: 1,
                        new_images: 1,
                        new_video: 1,
                        new_video_type: 1,
                        new_mota: 1,
                        new_quyenloi: 1,
                        new_hoahong: 1,
                        new_do: 1,
                        new_ho_so: 1,
                        nm_type: 1,
                        nm_id: 1,
                        nm_min_value: 1,
                        nm_max_value: 1,
                        nm_unit: 1,
                        new_301: 1,
                        new_yeucau: 1,
                        nm_unit: 1,
                        new_tgtv: 1,
                        new_lv: 1,
                        new_user_id: 1,
                        new_active: 1,
                        new_title_seo: 1,
                        new_md5: 1,
                        new_des_seo: 1,
                        no_jobposting: 1,
                        new_badge: 1,
                        new_test: 1,
                        usc_id: '$user.idTimViec365',
                        id_qlc: '$user.idQLC',
                        usc_company: '$user.userName',
                        usc_alias: '$user.alias',
                        usc_phone: '$user.phone',
                        usc_phone_tk: '$user.phoneTK',
                        usc_logo: '$user.avatarUser',
                        usc_address: '$user.address',
                        usc_name: '$user.userName',
                        usc_name_add: '$user.inForCompany.timviec365.usc_name_add',
                        usc_name_phone: '$user.inForCompany.timviec365.usc_name_phone',
                        usc_name_email: '$user.inForCompany.timviec365.usc_name_email',
                        usc_email: '$user.email',
                        usc_create_time: '$user.createdAt',
                        usc_pass: '$user.password',
                        usc_badge: "$user.inForCompany.timviec365.usc_badge",
                        chat365_id: "$user._id",
                        isOnline: "$user.isOnline",
                        usc_time_login: "$user.time_login",
                        chat365_secret: "$user.chat365_secret",
                        usc_video_com: '',
                        new_images: [],
                        sum_star: null,
                        count_star: "0",
                        voted: "0"
                    }
                },
            ]);

            if (result.length > 0) {
                const post = result[0];

                // Tăng lượt xem
                await NewTV365.updateOne({ new_id: newID }, {
                    $set: {
                        new_view_count: Number(post.new_view_count) + 1
                    }
                });

                // Xử lý hình ảnh cdn
                post.usc_logo = await functions.getUrlLogoCompany(post.usc_create_time, post.usc_logo);
                post.saved = statusSavePost;
                post.applied = statusApply;
                if (!post.new_des_seo) {
                    post.new_des_seo = '';
                }

                // Xử lý đếm số sao đánh giá
                const countVote = await SaveVote.aggregate([
                    { $match: { id_be_vote: newID, type: 'new' } },
                    {
                        $group: {
                            _id: null,
                            sum: { $sum: '$star' },
                            count: { $sum: 1 }
                        }
                    }
                ]);
                if (countVote.length > 0) {
                    post.sum_star = countVote[0].sum;
                    post.count_star = countVote[0].count;
                }

                // Xử lý chuyển từ mảng -> chuỗi phục vụ trả về cho frontend
                const array_new_cat = post.new_cat_id,
                    new_cat_id = post.new_cat_id.toString(),
                    array_new_city = post.new_city,
                    new_city = post.new_city.toString(),
                    array_new_qh = post.new_qh_id,
                    new_qh_id = post.new_qh_id.toString();

                // Trả về cho frontend dạng text
                post.new_cat_id = new_cat_id;
                post.new_city = new_city;
                post.new_qh_id = new_qh_id;

                // Xử lý lĩnh vực
                let list_lv = [];
                if (post.new_lv != null) {
                    list_lv = await Keyword.find({
                            key_name: { $ne: '' },
                            key_cate_id: 0,
                            key_city_id: 0,
                            key_cb_id: 0,
                            key_301: '',
                            key_name: { $in: post.new_lv.split(',') }
                        })
                        .select("key_name key_id key_type").lean();
                }
                post.new_lv = list_lv;

                let list_qh = [];
                // Lấy ra danh sách tag theo quận huyện
                if (array_new_qh.length > 0) {
                    list_qh = await Keyword.find({
                            key_name: "",
                            key_cate_id: 0,
                            key_city_id: { $ne: 0 },
                            key_qh_id: { $ne: 0 },
                            key_cb_id: 0,
                            key_qh_id: { $in: array_new_qh }
                        })
                        .select("key_id key_city_id key_qh_id").lean();
                }
                post.list_qh = list_qh;

                let listApplyText = "";
                const user = await functions.getTokenUser(req, res);
                // Xử lý luồng người dùng đăng nhập
                if (user) {
                    const userID = user.idTimViec365;
                    // Xử lý luồng đánh giá sao
                    let user_type_vote = 1;
                    if (user.type == 0 || user.type == 2) {
                        user_type_vote = 0;
                    }
                    const votePost = await functions.getDatafindOne(SaveVote, {
                        id_be_vote: newID,
                        type: "new",
                        userId: userID,
                        user_type_vote: user_type_vote
                    });
                    if (votePost) {
                        post.voted = 1;
                    }

                    // Xử lý luồng ứng viên
                    if (user.type == 0) {
                        //check ứng viên ứng tuyển hoặc lưu tin
                        const apply = await functions.getDatafindOne(ApplyForJob, { nhs_use_id: userID, nhs_new_id: newID, nhs_kq: { $ne: 10 } }),
                            savePost = await functions.getDatafindOne(UserSavePost, { use_id: userID, new_id: newID });
                        if (apply) {
                            statusApply = true
                        }
                        if (savePost) {
                            statusSavePost = true
                        }

                        // Danh sách id tin tuyển dụng ứng viên đã ứng tuyển
                        const listApply = ApplyForJob.find({ nhs_use_id: userID, nhs_new_id: newID, nhs_kq: { $ne: 10 } }, { nhs_new_id: 1 }).lean();
                        let arrIdApply = [];
                        for (let i = 0; i < listApply.length; i++) {
                            const element = listApply[i];
                            arrIdApply.push(element.nhs_new_id);
                        }
                        listApplyText = arrIdApply.toString();

                        // Thêm vào lịch sử xem tin
                        const getItemMaxHistory = await TblHistoryViewed.findOne({}, { id: 1 }).sort({ id: -1 }).limit(1).lean();
                        const itemHistory = new TblHistoryViewed({
                            id: Number(getItemMaxHistory.id) + 1,
                            id_uv: userID,
                            id_new: newID,
                            time_view: functions.getTimeNow()
                        });
                        await itemHistory.save();

                        // Check hồ sơ
                        const check_hs = await Profile.find({ hs_use_id: userID }, {
                            hs_id: 1,
                            hs_link: 1,
                            hs_active: 1,
                            hs_name: 1,
                            hs_create_time: 1
                        }).limit(3);

                        if (check_hs) {
                            if (check_hs.length < 2) {
                                post.tv365_nc = 0;
                            } else {
                                post.tv365_nc = 2;
                            }
                        }
                    }

                }
                post.listApplyText = listApplyText;
                // Kết thúc luồng xử lý ứng viên đăng nhập

                //lấy ra những người comment, comment và tổng số comment
                // post.commentName = await CommentPost.find({
                //     cm_new_id: newID
                // }, "senderName").limit(20);

                // post.countComment = await CommentPost.countDocuments({
                //     cm_new_id: newID
                // });

                //lấy ra những người like, like và tổng số like
                // let ListLikePost = await LikePost.aggregate([{
                //         $match: {
                //             lk_new_id: Number(newID),
                //             lk_type: { $ne: 8 },
                //             lk_for_comment: 0
                //         }
                //     },
                //     {
                //         $lookup: {
                //             from: "Users",
                //             localField: "lk_user_idchat",
                //             foreignField: "_id",
                //             as: "user"
                //         }
                //     },
                //     {
                //         $unwind: "$user"
                //     },
                //     {
                //         $skip: 0
                //     },
                //     {
                //         $project: {
                //             "user.userName": 1
                //         }
                //     },
                // ]);
                // post.countLike = ListLikePost.length
                // post.likeName = ListLikePost

                //lấy ra những người chia sẻ và số lần chia sẻ
                // let ListSharePost = await LikePost.aggregate([{
                //         $match: {
                //             lk_new_id: Number(newID),
                //             lk_type: { $eq: 8 },
                //             lk_for_comment: 0
                //         }
                //     },
                //     {
                //         $lookup: {
                //             from: "Users",
                //             localField: "lk_user_idchat",
                //             foreignField: "_id",
                //             as: "user"
                //         }
                //     },
                //     {
                //         $unwind: "$user"
                //     },
                //     {
                //         $skip: 0
                //     },
                //     {
                //         $project: {
                //             "user.userName": 1
                //         }
                //     },
                // ]);
                // post.countShare = ListSharePost.length
                // post.shareName = ListSharePost

                //box đia điểm
                let findKeyCity = await Keyword.find({
                    key_cb_id: 0,
                    key_cate_id: 0,
                    key_name: '',
                    key_qh_id: { $ne: 0 },
                    key_city_id: { $in: Number(array_new_city) },
                }, {
                    _id: 1,
                    key_cate_id: 1,
                    key_city_id: 1,
                    key_qh_id: 1,
                    key_type: 1
                }).limit(20)

                //box chức danh
                let title = post.new_title.toLowerCase()

                let keyName = ["thực tập", "chuyên viên", "nhân viên", "trưởng phòng", "trưởng nhóm",
                    "trợ lý", "phó trưởng phòng", "phó giám đốc", "giám đốc", "quản lý", "quản đốc"
                ]

                let findChucDanh = await Keyword.find({
                    key_name: { $in: keyName.map(name => new RegExp(name, "i")) },
                    key_cate_lq: { $in: array_new_cat },
                    key_city_id: { $in: array_new_city },
                    $or: [
                        { key_qh_id: { $in: array_new_qh } },
                        { key_qh_id: { $nin: array_new_qh } }
                    ]
                }, {
                    _id: 1,
                    key_cate_id: 1,
                    key_name: 1,
                    key_city_id: 1,
                    key_qh_id: 1,
                    key_cb_id: 1,
                    key_type: 1
                }).sort({ key_qh_id: { $in: array_new_qh } ? -1 : 1 }).limit(20)

                //box từ khóa liên quan

                let keyNameLq1 = ["tuyển", "gấp", "hot", "tại", "thực tập", "nhân viên", "chuyên viên", "giám đốc",
                    "trưởng phòng", "trưởng nhóm", "trợ lý", "phó trưởng phòng", "phó giám đốc", "quản lý", "quản đốc"
                ]

                const keyNameLq2 = `(${keyNameLq1.join('|')})`;
                let findTuKhoaLienQuan = await Keyword.find({
                    key_name: { $not: { $regex: keyNameLq2, $options: 'i' } },
                    key_name: { $ne: "" },
                    key_city_id: 0,
                    key_cate_lq: { $in: array_new_cat },
                    key_cb_id: 0,
                    $or: [
                        { key_qh_id: { $in: array_new_qh } },
                        { key_qh_id: { $nin: array_new_qh } }
                    ]
                }, {
                    _id: 1,
                    key_cate_id: 1,
                    key_city_id: 1,
                    key_name: 1,
                    key_qh_id: 1,
                    key_type: 1
                }).sort({ key_qh_id: { $in: array_new_qh } ? -1 : 1 }).limit(20);

                let keyBlogLienQuan = await functions.replaceMQ(post.new_title);
                keyBlogLienQuan = await functions.replaceKeywordSearch(1, keyBlogLienQuan);
                keyBlogLienQuan = await functions.removerTinlq(keyBlogLienQuan);
                let regexKeyBlog = new RegExp(keyBlogLienQuan.replace(/\s+/g, ".*"), "i");

                //box hướng dẫn

                let huongDan = await Blog.find({
                    new_title: { $regex: regexKeyBlog }
                }, { new_id: 1, new_title: 1, new_title_rewrite: 1, new_picture: 1 }).sort({ new_id: -1 }).limit(4);

                for (let i = 0; i < huongDan.length; i++) {
                    const element = huongDan[i];
                    element.new_picture = functions.getPictureBlogTv365(element.new_picture);
                }

                return functions.success(res, "Chi tiết tin tuyển dụng", {
                    data: post,
                    dia_diem: findKeyCity,
                    chuc_danh: findChucDanh,
                    tu_khoa: findTuKhoaLienQuan,
                    HuongDan: huongDan
                });
            } else return functions.setError(res, 'không có tin tuyển dụng này', 404)

        }
        return functions.setError(res, 'thiếu dữ liệu', 404);
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// danh sách bình luận của chi tiết tin
exports.listComment = async(req, res) => {
    try {
        const request = req.body,
            new_id = Number(request.new_id) || null,
            page = Number(request.page) || 0,
            pageSize = Number(request.pageSize) || 10,
            skip = (page - 1) * pageSize;
        if (new_id) {
            const checkNew = await NewTV365.countDocuments({ new_id: new_id });
            if (checkNew > 0) {
                const result = await service.inforLikeComment(new_id);
                const listComment = await CommentPost.find({ cm_new_id: new_id, cm_parent_id: 0 })
                    .skip(skip)
                    .limit(pageSize)
                    .sort({ cm_time: -1 })
                    .lean();

                for (let i = 0; i < listComment.length; i++) {
                    const element = listComment[i];
                    const arr_likes = await service.inforLikeChild(new_id, element.cm_id);
                    element.arr_likes = arr_likes;

                    const arr_reply = await service.inforCommentChild(new_id, element.cm_id);
                    element.arr_reply = arr_reply;
                }
            }
            return functions.setError(res, "Tin không tồn tại");
        }
        return functions.setError(res, "Chưa truyền ID");
    } catch (error) {
        console.log(error)
        return functions.setError(res, error);
    }
}

// ren ra url tìm kiếm việc làm
exports.renderUrlSearch = async(req, res, next) => {
    try {
        const request = req.body,
            cate_id = Number(request.cate_id) || 0,
            city_id = Number(request.city_id) || 0,
            key_word = request.key_word || "",
            district_id = Number(request.district_id) || 0,
            cb_id = Number(request.cb_id) || 0;
        let result = [];
        if (district_id == 0) {
            result = await Keyword.find({
                key_name: { $regex: key_word },
                key_cate_id: cate_id,
                key_city_id: city_id,
                key_cb_id: cb_id,
                key_qh_id: 0
            }).limit(1).lean();
        } else {
            var match = await Keyword.aggregate([{
                    $match: {
                        key_name: key_word,
                        key_cate_id: cate_id,
                        key_city_id: city_id,
                        key_cb_id: cb_id,
                        key_qh_id: district_id
                    }
                },
                {
                    $lookup: {
                        from: "District",
                        localField: "key_qh_id",
                        foreignField: "_id",
                        as: "qh",
                    }
                },
                {
                    $unwind: "$qh"
                },
                { $limit: 1 }
            ]);
            if (match) {
                result = match[0];
            } else {
                result = [];
            }
        }

        await functions.success(res, "Kết quả tìm kiếm", { result: result });

    } catch (error) {
        console.log(error);
    }
}

// trả ra thông tin seo của tag để tìm kiếm api
exports.getDataTag = async(req, res, next) => {
    const request = req.body,
        keyid = request.keyid || 0,
        keyw = request.keyw || "";
    let data;
    if (keyid != 0) {
        data = await Keyword.findOne({
            _id: keyid
        }).lean();
    } else {
        data = await Keyword.findOne({
            key_name: keyw,
            key_err: 1
        });
    }

    return await functions.success(res, "lấy thông tin thành công", { data });
}

exports.addNewFromTv365 = async(req, res) => {
    try {
        // await NewTV365.deleteMany();
        // return functions.success(res, "Xóa xong");
        let request = req.body,
            new_id = request.new_id,
            new_title = request.new_title,
            new_md5 = request.new_md5,
            new_alias = request.new_alias,
            new_301 = request.new_301,
            new_cat_id = request.new_cat_id,
            new_real_cate = request.new_real_cate,
            new_city = request.new_city,
            new_qh_id = request.new_qh_id,
            new_addr = request.new_addr,
            new_money = request.new_money,
            new_cap_bac = request.new_cap_bac,
            new_exp = request.new_exp,
            new_bang_cap = request.new_bang_cap,
            new_gioi_tinh = request.new_gioi_tinh,
            new_so_luong = request.new_so_luong,
            new_hinh_thuc = request.new_hinh_thuc,
            new_user_id = request.new_user_id,
            new_user_redirect = request.new_user_redirect,
            new_do_tuoi = request.new_do_tuoi,
            new_create_time = request.new_create_time,
            new_update_time = request.new_update_time,
            new_vip_time = request.new_vip_time,
            new_vip = request.new_vip,
            new_cate_time = request.new_cate_time,
            new_active = request.new_active,
            new_type = request.new_type,
            new_over = request.new_over,
            new_view_count = request.new_view_count,
            new_han_nop = request.new_han_nop,
            new_post = request.new_post,
            new_renew = request.new_renew,
            new_hot = request.new_hot,
            new_do = request.new_do,
            new_gap = request.new_gap,
            new_cao = request.new_cao,
            new_nganh = request.new_nganh,
            new_ghim = request.new_ghim,
            new_thuc = request.new_thuc,
            new_order = request.new_order,
            new_ut = request.new_ut,
            send_vip = request.send_vip,
            new_hide_admin = request.new_hide_admin,
            new_point = request.new_point,
            new_test = request.new_test,
            new_badge = request.new_badge,

            // Cập nhật new_multi
            new_mota = request.new_mota,
            new_yeucau = request.new_yeucau,
            new_quyenloi = request.new_quyenloi,
            new_ho_so = request.new_ho_so,
            new_title_seo = request.new_title_seo,
            new_des_seo = request.new_des_seo,
            new_hoahong = request.new_hoahong,
            new_tgtv = request.new_tgtv,
            new_lv = request.new_lv,
            new_bao_luu = request.new_bao_luu,
            time_bao_luu = request.time_bao_luu,
            no_jobposting = request.no_jobposting,
            new_video = request.new_video,
            new_video_type = request.new_video_type,
            new_video_active = request.new_video_active,
            new_images = request.new_images.split(",").map(String) || null,

            // Cập nhật new_money
            nm_id = request.nm_id,
            nm_type = request.nm_type,
            nm_min_value = request.nm_min_value,
            nm_max_value = request.nm_max_value,
            nm_unit = request.nm_unit;

        const newTV = new NewTV365({
            new_id: new_id,
            new_title: new_title,
            new_md5: new_md5,
            new_alias: new_alias,
            new_301: new_301,
            new_cat_id: new_cat_id.split(",").map(Number),
            new_real_cate: new_real_cate,
            new_city: new_city.split(",").map(Number),
            new_qh_id: new_qh_id.split(",").map(Number),
            new_addr: new_addr,
            new_money: new_money,
            new_cap_bac: new_cap_bac,
            new_exp: new_exp,
            new_bang_cap: new_bang_cap,
            new_gioi_tinh: new_gioi_tinh,
            new_so_luong: new_so_luong,
            new_hinh_thuc: new_hinh_thuc,
            new_user_id: new_user_id,
            new_user_redirect: new_user_redirect,
            new_do_tuoi: new_do_tuoi,
            new_create_time: new_create_time,
            new_update_time: new_update_time,
            new_vip_time: new_vip_time,
            new_vip: new_vip,
            new_cate_time: new_cate_time,
            new_active: new_active,
            new_type: new_type,
            new_over: new_over,
            new_view_count: new_view_count,
            new_han_nop: new_han_nop,
            new_post: new_post,
            new_renew: new_renew,
            new_hot: new_hot,
            new_do: new_do,
            new_gap: new_gap,
            new_cao: new_cao,
            new_nganh: new_nganh,
            new_ghim: new_ghim,
            new_thuc: new_thuc,
            new_order: new_order,
            new_ut: new_ut,
            send_vip: send_vip,
            new_hide_admin: new_hide_admin,
            new_point: new_point,
            new_test: new_test,
            new_badge: new_badge,

            // Cập nhật new_multi
            new_mota: new_mota,
            new_yeucau: new_yeucau,
            new_quyenloi: new_quyenloi,
            new_ho_so: new_ho_so,
            new_title_seo: new_title_seo,
            new_des_seo: new_des_seo,
            new_hoahong: new_hoahong,
            new_tgtv: new_tgtv,
            new_lv: new_lv,
            new_bao_luu: new_bao_luu,
            time_bao_luu: time_bao_luu,
            no_jobposting: no_jobposting,
            new_video: new_video,
            new_video_type: new_video_type,
            new_video_active: new_video_active,
            new_images: new_images,

            // Cập nhật new_money
            nm_id: nm_id,
            nm_type: nm_type,
            nm_min_value: nm_min_value,
            nm_max_value: nm_max_value,
            nm_unit: nm_unit
        });
        await newTV.save().then().catch(err => {

        });

        return functions.success(res, "tạo bài tuyển dụng thành công");
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// Cập nhật điểm cho tin tuyển dụng
exports.updatePointNew = async(req, res) => {
    try {
        const new_id = req.body.new_id;
        if (new_id) {
            const findNew = await NewTV365.findOne({ new_id }, { new_point: 1 }).lean();
            if (findNew) {
                // Cập nhật điểm
                await NewTV365.updateOne({ new_id }, {
                    $set: {
                        new_point: Number(findNew.new_point) + 1
                    }
                });

                // Lưu vào lịch sử
                const point = 1,
                    type = 0;
                await service.logHistoryNewPoint(new_id, point, type);

                return functions.success(res, "Cập nhật điểm khi xem tin thành công");
            }
            return functions.setError(res, "Tin tuyển dụng không tồn tại");
        }
    } catch (error) {
        console.log(error);
        return functions.setError(res, "Đã có lỗi xảy ra");
    }
}

exports.sampleJobPostings = async(req, res) => {
    try {
        const lg_cate = req.body.lg_cate || 0,
            now = functions.getTimeNow(),
            time_start = now - (60 * 86400);
        let new365;
        if (lg_cate != 0) {
            new365 = await NewTV365.findOne({
                    new_cat_id: [lg_cate],
                    new_create_time: { $gte: time_start, $lte: now }
                })
                .select("new_id")
                .sort({ new_point: -1 })
                .limit(1);
        } else if (lg_cate == 0) {
            new365 = await NewTV365.findOne({})
                .select("new_id")
                .sort({ new_point: -1, new_id: -1 })
                .limit(1);
        }
        let data = {};
        if (new365) {
            const new_id = new365.new_id;
            const sampleJobPostings = await NewTV365.aggregate([
                { $match: { new_id: Number(new_id) } },
                {
                    $lookup: {
                        from: "Users",
                        localField: "new_user_id",
                        foreignField: "idTimViec365",
                        as: "user",
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $match: {
                        "user.type": 1
                    }
                }, {
                    $project: {
                        _id: 0,
                        new_id: 1,
                        new_title: 1,
                        new_han_nop: 1,
                        nm_id: 1,
                        nm_type: 1,
                        nm_unit: 1,
                        nm_min_value: 1,
                        nm_max_value: 1,
                        new_money: 1,
                        new_exp: 1,
                        new_gioi_tinh: 1,
                        new_so_luong: 1,
                        new_bang_cap: 1,
                        new_cap_bac: 1,
                        new_hinh_thuc: 1,
                        new_cat_id: 1,
                        usc_id: "$user.idTimViec365",
                        usc_company: "$user.userName",
                        usc_alias: "$user.alias",
                        usc_logo: "$user.avatarUser",
                        usc_create_time: "$user.createdAt",
                        new_city: 1,
                        new_qh_id: 1,
                        new_addr: 1,
                        new_mota: 1,
                        new_yeucau: 1,
                        new_quyenloi: 1,
                        new_ho_so: 1,
                        new_create_time: 1,
                        new_update_time: 1,
                        new_view_count: 1,
                        new_hoahong: 1,
                        new_tgtv: 1
                    }
                }
            ]);

            data = sampleJobPostings[0];
            data.new_cat_id = data.new_cat_id.toString();
            data.new_city = data.new_city.toString();
            data.new_qh_id = data.new_qh_id.toString();
            data.usc_logo = functions.getUrlLogoCompany(data.usc_create_time, data.usc_logo);
            data.db_tgian = await HistoryNewPoint.countDocuments({ nh_type_point: 0, nh_new_id: data.new_id });

            const db_luot = await ApplyForJob.countDocuments({
                    nhs_new_id: data.new_id,
                    nhs_kq: { $in: [0, 2, 13] }
                }),
                db_cvg = await ApplyForJob.countDocuments({
                    nhs_new_id: data.new_id,
                    nhs_kq: { $in: [10, 11, 12, 14] }
                });
            data.sl_ung_tuyen = db_luot + db_cvg;
        }
        return functions.success(res, "Lấy mẫu tin", { new: data });
    } catch (error) {
        console.log(error);
        return functions.setError(res, "Đã có lỗi xảy ra");
    }
}