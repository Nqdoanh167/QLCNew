const functions = require('../../../services/functions');
const tbl_qly_congvan = require('../../../models/Vanthu365/tbl_qly_congvan');
const vanthu = require('../../../services/vanthu.js');
const tbl_qlcv_edit = require('../../../models/Vanthu365/tbl_qlcv_edit');
// danh sách văn bản 
exports.getListVanBan = async (req, res, next) => {
    try {
        // khai báo biến
        let key = req.body.key;
        if (key) {
            key = key.toUpperCase();
        }
        let page = Number(req.body.page);
        let pageSize = Number(req.body.pageSize);
        let book = req.body.book;
        let dayStart = req.body.dayStart;
        let dayEnd = req.body.dayEnd;
        let comId = req.comId || 1763;
        let type = Number(req.body.type);
        //tạo phân trang
        let skip = (page - 1) * pageSize;
        let limit = pageSize;
        // khai báo điều kiện, đầu ra
        let data = {};
        let conditions = {};
        if (key) {
            conditions = {
                $or: [
                    { cv_name: { $regex: key } },
                    { cv_so: { $regex: key } }
                ]
            }
        }
        if (dayStart) conditions.cv_date = { $gte: new Date(dayStart) }
        if (dayEnd) conditions.cv_date = { $gte: new Date(dayEnd) }
        if (book) conditions.cv_id_book = book
        conditions.cv_usc_id = comId;
        conditions.cv_type_xoa = 0;
        conditions.cv_type_hd = 0;
        if (type === 1) {
            conditions.cv_type_loai = 1;
        } else {
            conditions.cv_type_loai = 2;
        }
        let db_qr = await tbl_qly_congvan.find(conditions).sort({ cv_date: -1 }).skip(skip).limit(limit)
        let count = await tbl_qly_congvan.countDocuments(conditions)
        data.count = count;
        data.db_qr = db_qr;
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.log("🚀 ~ file: listVanBanController.js:27 ~ exports.getListVanBanDen= ~ error:", error)
        return functions.setError(res, error)
    }
};

// tạo mới văn bản đến
exports.createIncomingText = async (req, res, next) => {
    try {
        let comId = req.comId || 1763;
        let name_vbden = req.body.name_vbden;
        let type_vbden = req.body.type_vbden;
        let so_vbden = req.body.so_vbden;
        let type_gui_vbden = Number(req.body.type_gui_vbden);
        let noi_gui_vbden = Number(req.body.noi_gui_vbden);
        let text_gui_vbden = req.body.text_gui_vbden;
        let user_gui_vbden = req.body.user_gui_vbden;
        let text_user_gui_vbden = req.body.text_user_gui_vbden;
        let date_nhan = req.body.date_nhan;
        let use_nhan_vbden = Number(req.body.use_nhan_vbden);
        let use_luu_vbden = Number(req.body.use_luu_vbden);
        let book_vb = Number(req.body.book_vb);
        let trich_yeu_vbden = req.body.trich_yeu_vbden;
        let ghi_chu_vbden = req.body.ghi_chu_vbden;
        let file = req.files;
        let cv_file = [];
        let cv_time_create = new Date();
        if (file && file.file && file.file.length > 0) {
            for (let i = 0; i < file.file.length; i++) {
                let checkUpload = await vanthu.uploadfile('file_van_ban', file.file[i])

                if (checkUpload === false) {
                    return functions.setError(res, 'upload failed', 400)
                }
                cv_file.push({ file: checkUpload })
            }
        } else if (file && file.file) {
            let checkUpload = await vanthu.uploadfile('file_van_ban', file.file)
            if (checkUpload === false) {
                return functions.setError(res, 'upload failed', 400)
            }
            cv_file.push({ file: checkUpload })
        }
        if (await functions.checkTime(date_nhan) === false || functions.checkDate(date_nhan) === false) {
            return functions.setError(res, 'invalid date', 400)
        }
        
        if (await !functions.checkNumber(type_gui_vbden) || await !functions.checkNumber(noi_gui_vbden) ||
            await !functions.checkNumber(use_nhan_vbden) || await !functions.checkNumber(use_luu_vbden)
            || await !functions.checkNumber(book_vb)) {
            return functions.setError(res, 'invalid number', 400)
        }
        if (type_vbden.length !== 0) {
            type_vbden = type_vbden.join(" ")
        }

        let _id = await vanthu.getMaxID(tbl_qly_congvan)
        if (name_vbden && so_vbden && type_gui_vbden && text_gui_vbden
            && date_nhan && text_user_gui_vbden && use_luu_vbden && use_nhan_vbden && trich_yeu_vbden) {
            await tbl_qly_congvan.create({
                _id,
                cv_name: name_vbden,
                cv_kieu: type_vbden,
                cv_so: so_vbden,
                cv_type_soan: type_gui_vbden,
                cv_soan_ngoai: text_gui_vbden,
                cv_phong_soan: noi_gui_vbden,
                cv_user_soan: user_gui_vbden,
                cv_id_book: book_vb,
                cv_date: date_nhan,
                cv_name_soan: text_user_gui_vbden,
                cv_user_save: use_luu_vbden,
                cv_type_nhan: 1,
                cv_nhan_noibo: use_nhan_vbden,
                cv_file: cv_file,
                cv_trich_yeu: trich_yeu_vbden,
                cv_ghi_chu: ghi_chu_vbden,
                cv_type_loai: 1,
                cv_usc_id: comId,
                cv_time_created: cv_time_create
            })
        } else {
            return functions.setError(res, 'missing data', 400)
        }
        return functions.success(res, 'add successfully')
    } catch (err) {
        console.error(err)
        return functions.setError(res, err)
    }
};

// sửa văn bản đến
exports.updateIncomingText = async (req, res, next) => {
    try {
        let comId = req.comId || 1763;
        let name_vbden = req.body.name_vbden;
        let type_vbden = req.body.type_vbden;
        let so_vbden = req.body.so_vbden;
        let type_gui_vbden = Number(req.body.type_gui_vbden);
        let noi_gui_vbden = Number(req.body.noi_gui_vbden);
        let text_gui_vbden = req.body.text_gui_vbden;
        let user_gui_vbden = req.body.user_gui_vbden;
        let text_user_gui_vbden = req.body.text_user_gui_vbden;
        let date_nhan = req.body.date_nhan;
        let use_nhan_vbden = Number(req.body.use_nhan_vbden);
        let use_luu_vbden = Number(req.body.use_luu_vbden);
        let book_vb = Number(req.body.book_vb);
        let trich_yeu_vbden = req.body.trich_yeu_vbden;
        let ghi_chu_vbden = req.body.ghi_chu_vbden;
        let id = Number(req.body.id);
        let file = req.files;
        let useId = req.useId;
        let cv_file = [];
        if (!id) return functions.setError(res, 'not found incomming text', 404);
        let check = await tbl_qly_congvan.findById(id)
        if (!check) {
            return functions.setError(res, 'not found incomming text', 404);
        }
        let checkUpload = '';
        if (file && file.file && file.file.length > 0) {
            for (let i = 0; i < file.file.length; i++) {
                checkUpload = await vanthu.uploadfile('file_van_ban', file.file[i])
                if (checkUpload === false) {
                    return functions.setError(res, 'upload failed', 400)
                }
                cv_file.push({ file: checkUpload })
            }
            if (check.cv_file) {
                for (let i = 0; i < check.cv_file.length; i++) {
                    vanthu.deleteFile(check.cv_file[i].file)
                }
            }
            await tbl_qly_congvan.findByIdAndUpdate(id, { cv_file })
        } else if (file && file.file) {
            checkUpload = await vanthu.uploadfile('file_van_ban', file.file)
            if (checkUpload === false) {
                return functions.setError(res, 'upload failed', 400)
            }
            cv_file.push({ file: checkUpload })
            if (check.cv_file) {
                for (let i = 0; i < check.cv_file.length; i++) {
                    vanthu.deleteFile(check.cv_file[i].file)
                }
            }
            await tbl_qly_congvan.findByIdAndUpdate(id, { cv_file })
        }

        if (await !functions.checkNumber(type_gui_vbden) || await !functions.checkNumber(noi_gui_vbden) ||
            await !functions.checkNumber(use_nhan_vbden) || await !functions.checkNumber(use_luu_vbden)
            || await !functions.checkNumber(book_vb)) {
            return functions.setError(res, 'invalid number', 400)
        }
        if (type_vbden && type_vbden.length !== 0) {
            type_vbden = type_vbden.join(" ")
        }
        let cv_time_update = new Date();
        let type_edit = 0;
        let noi_dung = '';
        if (await functions.checkTime(date_nhan) === false || functions.checkDate(date_nhan) === false) {
            return functions.setError(res, 'invalid date', 400)
        }

        if (name_vbden && so_vbden && type_gui_vbden && text_gui_vbden
            && date_nhan && text_user_gui_vbden && use_luu_vbden && use_nhan_vbden && trich_yeu_vbden) {
            if (name_vbden !== check.cv_name) noi_dung += 'Tên văn bản,'
            if (type_vbden !== check.cv_kieu) noi_dung += 'Kiểu văn bản,'
            if (so_vbden !== check.cv_so) noi_dung += 'Số văn bản,'
            if (type_gui_vbden !== check.cv_type_soan) noi_dung += 'Chọn nơi gửi,'
            if (noi_gui_vbden !== check.cv_phong_soan) noi_dung += 'Nơi gửi nội bộ,'
            if (text_gui_vbden !== check.cv_soan_ngoai) noi_dung += 'Nơi gửi ngoài,'
            if (user_gui_vbden !== check.cv_user_soan) noi_dung += 'Người gửi nội bộ,'
            if (date_nhan !== check.cv_name_soan) noi_dung += 'Người gửi ngoài,'
            if (name_vbden !== check.cv_date) noi_dung += 'Ngày nhận,'
            if (use_nhan_vbden !== check.cv_nhan_noibo) noi_dung += 'Nơi nhận văn bản,'
            if (use_luu_vbden !== check.cv_user_save) noi_dung += 'Người lưu trữ,'
            if (trich_yeu_vbden !== check.cv_trich_yeu) noi_dung += 'Trích yếu,'
            if (ghi_chu_vbden !== check.cv_ghi_chu) noi_dung += 'Ghi chú,'
            if (book_vb !== check.cv_id_book) noi_dung += 'Sổ văn bản,'
            if (file && file.file) noi_dung += 'File đính kèm,'
            let users = 0;
            if (noi_dung !== '') {
                type_edit = 1;
                if (useId == 0) {
                    type_user = 1;
                    users = comId;
                }
                else {
                    type_user = 2;
                    users = useId;
                }
                let _id = await vanthu.getMaxId(tbl_qlcv_edit)
                await tbl_qlcv_edit.create({
                    _id,
                    ed_cv_id: id,
                    ed_time: cv_time_update,
                    ed_type_user: type_user,
                    ed_nd: noi_dung,
                    ed_usc_id: comId
                })
            }
            await tbl_qly_congvan.findByIdAndUpdate(id, {
                cv_name: name_vbden,
                cv_kieu: type_vbden,
                cv_so: so_vbden,
                cv_type_soan: type_gui_vbden,
                cv_soan_ngoai: text_gui_vbden,
                cv_phong_soan: noi_gui_vbden,
                cv_user_soan: user_gui_vbden,
                cv_id_book: book_vb,
                cv_date: date_nhan,
                cv_name_soan: text_user_gui_vbden,
                cv_user_save: use_luu_vbden,
                cv_type_nhan: 1,
                cv_nhan_noibo: use_nhan_vbden,
                cv_trich_yeu: trich_yeu_vbden,
                cv_ghi_chu: ghi_chu_vbden,
                cv_usc_id: comId,
                cv_type_edit: type_edit,
                cv_time_edit: cv_time_update
            })

        } else {
            return functions.setError(res, 'missing data', 400)
        }

        return functions.success(res, 'update successfully')
    } catch (err) {
        console.error(err)
        return functions.setError(res, err)
    }
};

//chức năng xoá, khôi phục văn bản, active hợp đồng
exports.synthesisFunction = async (req, res, next) => {
    try {
        let id = Number(req.body.id);
        let action = req.body.action;
        let comId = Number(req.body.comId) || 1763;
        let useId = Number(req.useId) || 8;
        if (!id || !action) {
            return functions.setError(res, 'missing data input', 400)
        }
        // Chức năng xoá văn bản đến
        if (action === 'deleteIncomingText') {
            let type_user_xoa = 0;
            let user_xoa = 0;
            if (useId == 0) {
                type_user_xoa = 1;
                user_xoa = comId;
            }
            else {
                type_user_xoa = 2;
                user_xoa = useId;
            }
            let checkExists = await tbl_qly_congvan.findOne({ _id: id, cv_usc_id: comId });
            if (!checkExists) return functions.setError(res, 'not found incoming text', 404)
            await tbl_qly_congvan.findByIdAndUpdate(id, {
                cv_type_kp: 0,
                cv_type_xoa: 1,
                cv_type_user_xoa: type_user_xoa,
                cv_user_xoa: user_xoa,
                cv_time_xoa: new Date()
            })
            return functions.success(res, 'delete success')
        }
    } catch (error) {
        console.error(error)
        return functions.setError(res, error)
    }
};

// xem chi tiết (chung)
exports.getDetail = async (req, res, next) => {
    try {
        let id = Number(req.body.id);
        let model = req.body.model;
        let comId = Number(req.body.comId) || 1763;
        if (!id || !model) {
            return functions.setError(res, 'missing data input', 400)
        }
        let data = {};
        if (model === 'incomingText') {
            data = await tbl_qly_congvan.findOne({ _id: id, cv_usc_id: comId, cv_type_xoa: 0 })
        }
        return functions.success(res, 'delete success', { data })
    } catch (error) {
        console.error(error)
        return functions.setError(res, error)
    }
};

// tạo mới văn bản đi
exports.createSendText = async (req, res, next) => {
    try {
        let comId = req.comId || 1763;
        let name_vbdi = req.body.name_vbdi;
        let type_loai_vb = req.body.type_loai_vb;
        let so_vbdi = req.body.so_vbdi;
        let dvst_vbdi = req.body.dvst_vbdi;
        let nst_vbdi = req.body.nst_vbdi;
        let date_guidi = req.body.date_guidi;
        let use_luu_vbdi = req.body.use_luu_vbdi;
        let use_ky_vbdi = req.body.use_ky_vbdi;
        let nhanvb_dep = req.body.nhanvb_dep;
        let nhan_noibo_vb_di = req.body.nhan_noibo_vb_di;
        let nhan_ngoai_dep_vbdi = req.body.nhan_ngoai_dep_vbdi;
        let nhanvb_use = req.body.nhanvb_use;
        let nhan_use_vbdi = req.body.nhan_use_vbdi;
        let nhan_ngoai_user_vbdi = req.body.nhan_ngoai_user_vbdi;
        let trich_yeu_vbdi = req.body.trich_yeu_vbdi;
        let ghi_chu_vbdi = req.body.ghi_chu_vbdi;
        let book_vb = req.body.book_vb;
        let file = req.files;
        if (type_loai_vb && type_loai_vb.length !== 0) {
            type_loai_vb = type_loai_vb.join(" ")
        }
        if (nhanvb_dep && nhanvb_dep.length !== 0) {
            nhanvb_dep = nhanvb_dep.join(" ")
        }
        if (nhanvb_use && nhanvb_use.length !== 0) {
            nhanvb_use = nhanvb_use.join(" ")
        }
        let cv_file = [];
        if (name_vbdi && so_vbdi && date_guidi && use_luu_vbdi && use_ky_vbdi && trich_yeu_vbdi) {
            if (await !functions.checkNumber(dvst_vbdi) || await !functions.checkNumber(nst_vbdi) ||
                await !functions.checkNumber(use_luu_vbdi) || await !functions.checkNumber(use_ky_vbdi)
                || await !functions.checkNumber(book_vb)) {
                return functions.setError(res, 'invalid number', 400)
            }
            if (await functions.checkTime(date_guidi) === false || functions.checkDate(date_guidi) === false) {
                return functions.setError(res, 'invalid date', 400)
            }
            if (file && file.file && file.file.length > 0) {
                for (let i = 0; i < file.file.length; i++) {
                    let checkUpload = await vanthu.uploadfile('file_van_ban', file.file[i])

                    if (checkUpload === false) {
                        return functions.setError(res, 'upload failed', 400)
                    }
                    cv_file.push({ file: checkUpload })

                }
            } else if (file && file.file) {
                let checkUpload = await vanthu.uploadfile('file_van_ban', file.file)
                if (checkUpload === false) {
                    return functions.setError(res, 'upload failed', 400)
                }
                cv_file.push({ file: checkUpload })

            }
            let _id = await vanthu.getMaxID(tbl_qly_congvan)
            await tbl_qly_congvan.create({
                _id,
                cv_name: name_vbdi,
                cv_kieu: type_loai_vb,
                cv_so: so_vbdi,
                cv_type_soan: 1,
                cv_phong_soan: dvst_vbdi,
                cv_user_soan: nst_vbdi,
                cv_id_book: book_vb,
                cv_file: cv_file,
                cv_date: date_guidi,
                cv_user_save: use_luu_vbdi,
                cv_user_ky: use_ky_vbdi,
                cv_type_nhan: nhanvb_dep,
                cv_nhan_noibo: nhan_noibo_vb_di,
                cv_nhan_ngoai: nhan_ngoai_dep_vbdi,
                cv_type_chuyenden: nhanvb_use,
                cv_chuyen_noibo: nhan_use_vbdi,
                cv_chuyen_ngoai: nhan_ngoai_user_vbdi,
                cv_trich_yeu: trich_yeu_vbdi,
                cv_ghi_chu: ghi_chu_vbdi,
                cv_type_loai: 2,
                cv_usc_id: comId,
                cv_time_created: new Date()
            })
        } else {
            return functions.setError(res, 'missing data', 400)
        }
        return functions.success(res, 'add successfully')
    } catch (err) {
        console.error(err)
        return functions.setError(res, err)
    }
};