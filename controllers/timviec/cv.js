const functions = require("../../services/functions");
const service = require("../../services/timviec365/cv");
const CV = require("../../models/Timviec365/CV/Cv365");
const Users = require("../../models/Users");
const Application = require("../../models/Timviec365/CV/Application");
const Letter = require("../../models/Timviec365/CV/Letter");
const Resume = require("../../models/Timviec365/CV/Resume");
const SaveCvCandi = require("../../models/Timviec365/UserOnSite/Candicate/SaveCvCandi");
const CategoryCv = require("../../models/Timviec365/CV/Category");
const CVGroup = require("../../models/Timviec365/CV/CVGroup");
const Cv365Like = require("../../models/Timviec365/CV/Like");
const TblModules = require("../../models/Timviec365/CV/TblModules");
const Cv365TblFooter = require("../../models/Timviec365/CV/TblFooter");
const fs = require("fs");

// lấy tất cả danh sách mẫu CV
exports.getList = async(req, res, next) => {
    try {
        const request = req.body;
        let pageNumber = request.pageNumber || 1,
            pageSize = request.pageSize || 20,
            skip = (pageNumber - 1) * pageSize,
            lang = request.lang,
            cate = request.cate,
            designID = request.designID,
            sortBy = request.sortBy || "new",
            condition = {},
            sort = { vip: -1, thutu: -1 };

        if (lang != undefined) {
            condition.cate_id = lang;
        }
        if (cate != undefined) {
            condition.cate_id = cate;
        }
        if (designID != undefined) {
            condition.design_id = designID;
        }

        if (sortBy != "new") {
            sort = {
                download: -1,
            };
        }


        // Lấy data theo từng điều kiện
        let data;
        if (pageSize != "all") {
            data = await CV.find(condition).select("_id alias url_alias image view love download price cid name colors design_id")
                .sort(sort).skip(skip)
                .limit(pageSize).lean();
        } else {
            data = await CV.find(condition)
                .select("_id alias url_alias image view love download price cid name colors design_id")
                .sort(sort).lean();
        }

        // Lấy thông tin người dùng
        const user = await functions.getTokenUser(req, res);

        // Lấy danh sách cv ứng viên đã thích
        let listCvLike = [];
        if (user && user != 1) {
            listCvLike = await Cv365Like.find({
                uid: user.idTimViec365,
                type: 1
            }, "id").lean();
        }

        // Cập nhật data theo vòng lặp
        for (let i = 0; i < data.length; i++) {
            var element = data[i];
            element.image = await functions.getPictureCv(element.image);
            if (listCvLike.find(cv => cv.id == element._id)) {
                element.isLike = 1;
            } else {
                element.isLike = 0;
            }
        }

        // Lấy thông tin bài viết chân trang
        const footerNew = await Cv365TblFooter.findOne({}).select("content");

        return await functions.success(res, "Lấy mẫu CV thành công", { data, footerNew });
    } catch (err) {
        functions.setError(res, err.message);
    }
};

// lấy danh sách ngành cv
exports.getNganhCV = async(req, res, next) => {
    try {
        const data = await CategoryCv.find().select("_id name alias cId");

        return functions.success(res, "Danh sách ngành cv", { data });
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

//xem trước CV
exports.previewCV = async(req, res, next) => {
    try {
        const _id = req.body._id;
        const data = await CV.findOne({ _id: _id }).select(
            "_id lang_id name image mota_cv colors view"
        );

        if (data) {
            let view = data.view + 1; // cập nhật số lượng xem
            await CV.updateOne({ _id: _id }, { view: view });
            data.image = functions.getPictureCv(data.image);
            return await functions.success(res, "Lấy mẫu cv thành công", { data });
        }
        return functions.setError(res, "Không có dữ liệu", 404);
    } catch (e) {
        functions.setError(res, e.message);
    }
};

exports.listCvByCate = async(req, res, next) => {
    try {
        const alias = req.body.alias,
            cate_id = req.body.cate_id;
        if (alias || cate_id) {
            let condition = { alias };
            if (cate_id != null) {
                condition = { cid: Number(cate_id) };
            }

            let CateCv = await CategoryCv.findOne(condition).lean();
            if (CateCv) {
                // Lấy danh sách cv của ngành nghề đó
                const pageSize = req.body.pageSize,
                    listCv = await CV.find({
                            cate_id: CateCv._id,
                        },
                        "'_id alias url_alias image view love download price cid name colors design_id"
                    )
                    .sort({ vip: -1, _id: -1 })
                    .lean();

                // Xử lý hình ảnh cho bài viết chân trang
                if (CateCv.content != "") {
                    CateCv.content = functions.renderCDNImage(CateCv.content);
                }

                for (let i = 0; i < listCv.length; i++) {
                    const element = listCv[i];
                    element.image = await functions.getPictureCv(element.image);
                }

                return functions.success(res, "Danh sách cv theo ngành", {
                    items: CateCv,
                    listCv,
                });
            }
            return functions.setError(res, "Không tồn tại ngành cv");
        }
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

// chi tiết cv ( tạo cv)
exports.detail = async(req, res, next) => {
    try {
        const _id = req.body._id;
        let data = await CV.findOne({ _id: _id });

        if (data) {
            // cập nhật số lượng xem
            let view = data.view + 1;
            await CV.updateOne({ _id: _id }, { view: view });

            const user = await functions.getTokenUser(req, res, next);
            if (user != null) {
                const getCv = await SaveCvCandi.findOne({
                    uid: user.idTimViec365,
                    delete_cv: 0,
                    cvid: _id
                }).lean();
                if (getCv) {
                    data = getCv;
                }

                if (data && data.status == 0) {
                    await SaveCvCandi.updateOne({
                        uid: user.idTimViec365,
                        cvid: _id
                    }, {
                        $set: {
                            status: 1,
                            delete_cv: 0
                        }
                    });
                };
            }
            return functions.success(res, "Lấy CV thành công", { data });
        } else {
            await functions.setError(res, "Không có dữ liệu", 404);
        }
    } catch (e) {
        functions.setError(res, e.message);
    }
};

exports.like = async(req, res, next) => {
    try {
        const { type, idcv } = req.body;
        const user = req.user.data;
        if (type && idcv) {
            // Check xem có tồn tại không
            let checkItem;
            if (type == 1) {
                checkItem = await CV.findOne({
                    _id: idcv
                });
            } else if (type == 2) {
                checkItem = await Application.findOne({
                    _id: idcv
                });
            } else if (type == 3) {
                checkItem = await Letter.findOne({
                    _id: idcv
                });
            } else if (type == 4) {
                checkItem = await Resume.findOne({
                    _id: idcv
                });
            }
            // Nếu cv tồn tại và type thuộc 1,2,3,4
            if (checkItem && [1, 2, 3, 4].indexOf(Number(type)) != -1) {
                // Kiểm tra xem đã lưu cv hay chưa
                const userLike = await Cv365Like.findOne({
                    id: idcv,
                    uid: Number(user.idTimViec365),
                    type: type
                }).lean();

                // Nếu chưa like thì lưu lại vào bảng
                let result, message;
                if (!userLike) {
                    const item = new Cv365Like({
                        uid: user.idTimViec365,
                        id: idcv,
                        status: 1,
                        type: type
                    });
                    await item.save().then(() => {
                        result = "save";
                    });
                    await CV.updateOne({ _id: idcv }, { $inc: { love: 1 } });
                    message = "Lưu thành công";
                    result = true;
                } else {
                    await Cv365Like.deleteOne({
                        _id: userLike._id
                    });
                    message = "Bỏ lưu thành công";
                    result = false;
                }
                return await functions.success(res, message, { result });
            }
            return await functions.setError(res, "Không tồn tại cv hoặc tham số hợp lệ");
        }
        return await functions.setError(res, "Thiếu tham số");
    } catch (error) {
        return await functions.setError(res, error.message);
    }

}

//lưu và tải cv
exports.saveCV = async(req, res, next) => {
    try {
        const pmKey = req.user.data._id,
            userId = req.user.data.idTimViec365,
            cvid = req.body.id,
            allowSendChat = req.body.allowSendChat,
            height_cv = req.body.height_cv,
            name_img = req.body.name_img,
            name_img_hide = req.body.name_img_hide,
            html = req.body.html,
            lang = req.body.lang;

        let base64String = req.body.base64;
        if (cvid && base64String) {

            // Kiểm tra đã tạo cv hay chưa
            const checkSaveCv = await SaveCvCandi.findOne({
                uid: userId,
                cvid: cvid
            }).lean();

            // Đường dẫn ảnh
            const dir = `../storage/base365/timviec365/cv365/upload/ungvien/uv_${userId}`;

            const data = {
                uid: userId,
                cvid: cvid,
                html: html,
                lang: lang,
                time_edit: functions.getTimeNow(),
                height_cv: height_cv,
                cv: 1,
                status: 2,
                check_cv: 0,
                delete_cv: 0,
                delete_time: 0
            };

            // Nếu chưa tạo thì lưu vào
            if (!checkSaveCv) {
                let _id = 1;
                await SaveCvCandi.findOne({}, { id: 1 }).sort({ id: -1 }).then((res) => {
                    _id = res.id + 1;
                })
                data.id = _id;
                await SaveCvCandi.create(data);
            }
            // Nếu tạo rồi thì cập nhật đồng thời xóa cv cũ
            else {
                if (name_img && checkSaveCv.name_img != null) {
                    const filePath = `${dir}/${checkSaveCv.name_img}.png`;
                    await fs.access(filePath, fs.constants.F_OK, (error) => {
                        if (error) {} else {
                            // Tệp tin tồn tại
                            console.log('Tệp tin tồn tại.');
                            fs.unlink(filePath, (err) => {
                                if (err) throw err;
                                console.log('File was deleted');
                            });
                        }
                    });
                }
                if (name_img_hide && checkSaveCv.name_img_hide != null) {
                    const filePath = `${dir}/${checkSaveCv.name_img_hide}.png`;
                    await fs.access(filePath, fs.constants.F_OK, (error) => {
                        if (error) {} else {
                            // Tệp tin tồn tại
                            console.log('Tệp tin tồn tại.');
                            fs.unlink(`${dir}/${checkSaveCv.name_img_hide}.png`, (err) => {
                                if (err) throw err;
                                console.log('File cv hide was deleted');
                            });
                        }
                    });
                }
                await SaveCvCandi.updateOne({
                    _id: checkSaveCv._id
                }, {
                    $set: data
                });
            }

            // Kiểm tra xem đã tạo thư mục lưu ảnh chưa
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            // Đường dẫn tới nơi bạn muốn lưu ảnh
            let outputPath;
            if (name_img) {
                outputPath = `${dir}/${name_img}.png`;
            } else {
                outputPath = `${dir}/${name_img_hide}.png`;
            }

            // Xóa đầu mục của chuỗi Base64 (ví dụ: "data:image/png;base64,")
            const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

            // Giải mã chuỗi Base64 thành dữ liệu nhị phân
            const imageBuffer = Buffer.from(base64Data, "base64");

            // Ghi dữ liệu nhị phân vào tệp ảnh

            await fs.writeFile(outputPath, imageBuffer, (error) => {
                if (error) {
                    console.error("Lỗi khi ghi tệp ảnh");
                    return functions.setError(res, "Lỗi khi ghi tệp ảnh", 404);
                } else {
                    console.log("Chuyển đổi thành công! Tệp ảnh đã được lưu tại:" + outputPath);
                }
            });
            let message = "Lưu";
            const checkImage = await functions.checkImage(outputPath);
            if (checkImage) {
                if (name_img) {
                    await SaveCvCandi.updateOne({
                        uid: userId,
                        cvid: cvid
                    }, {
                        $set: {
                            name_img: name_img
                        }
                    });
                }
                if (name_img_hide) {
                    await SaveCvCandi.updateOne({
                        uid: userId,
                        cvid: cvid
                    }, {
                        $set: {
                            name_img_hide: name_img_hide
                        }
                    });
                }
            }
            //Gửi ảnh về
            if (allowSendChat == 1) {
                const host = "";
                const linkPdf = '';
                const linkImg = `${host}/timviec365/${userId}/cv/${name_img}.png`;
                const senderId = 1191;
                const text = "";
                const data = {
                    userId: userId,
                    senderId: senderId,
                    linkImg: linkImg,
                    linkPdf: linkPdf,
                    Title: text,
                };
                const respone = await axios.post(
                    "http://43.239.223.142:9000/api/message/SendMessageCv",
                    data
                );

                message += ",tải";
            }
            return await functions.success(res, `${message} thành công`);
        }
        return functions.setError(res, "Thông tin truyền lên không đầy đủ", 404);
    } catch (e) {
        console.log(e);
        return functions.setError(res, "Đã có lỗi xảy ra", 404);
    }
};

// xem CV viết sẵn
exports.viewAvailable = async(req, res, next) => {
    try {
        const cateId = req.params.cateId;
        const data = await CV.findOne({ cateId }).sort("-cvPoint").select("");
        if (!data) return await functions.setError(res, "Không có dữ liệu", 404);
        return await functions.success(res, "Thành công cv viết sẵn", data);
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

// tính điểm cv
exports.countPoints = async(req, res, next) => {
    try {
        const _id = req.query.id; // id cv
        const point = +req.query.p; // số point đc cộng
        const cv = await CV.findOne({ _id });
        if (cv) {
            const data = await CV.updateOne({ _id }, { $set: { cvPoint: cv.cvPoint + point } }).select("");
            if (data)
                return await functions.success(res, "Cập nhật điểm cv thành công");
        }
        return await functions.setError(res, "Không có dũ liệu", 404);
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

// tạo mới mẫu cv
exports.createCV = async(req, res, next) => {
    try {
        const user = req.user.data;
        if (user.role != 1)
            return await functions.setError(res, "Chưa có quyền truy cập", 404);
        const data = req.body;

        let _id = 1;
        await functions.getMaxID(CV).then((res) => {
            if (res) {
                _id = res + 1;
            }
        });
        data._id = _id;
        await CV.create(data);
        return await functions.success(res, "Tạo mới cv thành công");
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

// lấy dữ liệu mẫu cv cũ
exports.findCV = async(req, res, next) => {
    try {
        const user = req.user.data;
        if (user.role != 1)
            return await functions.setError(res, "Chưa có quyền truy cập");

        const _id = req.params._id;
        const data = await CV.findOne({ _id: _id });

        if (data) return functions.success(res, "Thành công", data);

        return functions.setError(res, "Không có dữ liêu", 404);
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

// update dữ liệu mẫu cv
exports.updateCV = async(req, res, next) => {
    try {
        const user = req.user.data;
        if (user.role != 1)
            return await functions.setError(res, "Chưa có quyền truy cập");
        const _id = req.params._id;
        const data = await CV.findOneAndUpdate({ _id: _id }, req.body);

        if (data) return functions.success(res, "Cập nhật thành công");

        return functions.setError(res, "Không có dữ liêu", 404);
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

//xóa mẫu cv
exports.deleteCV = async(req, res, next) => {
    try {
        const user = req.user.data;
        if (user.role != 1)
            return await functions.setError(res, "Chưa có quyền truy cập");
        const _id = req.params._id;
        const data = await CV.findOneAndDelete({ _id: _id });

        if (data) return functions.success(res, "Đã xóa thành công");

        return functions.setError(res, "Không có dữ liêu", 404);
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

// thêm ngành cv vào danh sách NganhCV
exports.createNganhCV = async(req, res, next) => {
    try {
        const user = req.user.data;
        if (user.role != 1)
            return await functions.setError(res, "Chưa có quyền truy cập");
        const data = req.body;

        let _id = 1;
        await functions.getMaxID(NganhCV).then((res) => {
            if (res) {
                _id = res + 1;
            }
        });
        data._id = _id;
        await CategoryCv.create(data);
        return await functions.success(res, "Tạo mới NganhcCV thành công");
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

// lấy dữ liệu NganhCV cũ
exports.findNganhCV = async(req, res, next) => {
    try {
        const user = req.user.data;
        if (user.role != 1)
            return await functions.setError(res, "Chưa có quyền truy cập");

        const _id = req.params._id;
        const data = await CategoryCv.findOne({ _id: _id });

        if (data) return functions.success(res, "Thành công", data);

        return functions.setError(res, "Không có dữ liêu", 404);
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

// update NganhCV
exports.updateNganhCV = async(req, res, next) => {
    try {
        const user = req.user.data;
        if (user.role != 1)
            return await functions.setError(res, "Chưa có quyền truy cập");
        const _id = req.params._id;
        const data = await CategoryCv.findOneAndUpdate({ _id: _id }, req.body);

        if (data) return functions.success(res, "Cập nhật thành công");

        return functions.setError(res, "Không có dữ liêu", 404);
    } catch (err) {
        return functions.setError(res, err.message);
    }
};

//xóa NganhCV
exports.deleteNganhCV = async(req, res, next) => {
    try {
        const user = req.user.data;
        if (user.role != 1)
            return await functions.setError(res, "Chưa có quyền truy cập");
        const _id = req.params._id;
        const data = await CategoryCv.findOneAndDelete({ _id: _id });

        if (data) return functions.success(res, "Đã xóa thành công");

        return functions.setError(res, "Không có dữ liêu", 404);
    } catch (err) {
        return functions.setError(res, err.message);
    }
};