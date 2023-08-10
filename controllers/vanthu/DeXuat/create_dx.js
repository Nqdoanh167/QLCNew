const De_Xuat = require('../../../models/Vanthu/de_xuat');
const functions = require('../../../services/vanthu');
const multer = require('multer');
const path = require('path');
const thongBao = require('../../../models/Vanthu365/tl_thong_bao');
const ThongBao = require("../../../models/Vanthu365/tl_thong_bao")
const DeXuat = require("../../../models/Vanthu/de_xuat");

//đề xuất xin nghỉ 
exports.de_xuat_xin_nghi = async(req, res) => {
        try {
            let {
                name_dx,
                kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
                id_user_duyet,
                id_user_theo_doi,
                phong_ban,
                ly_do,
                bd_nghi,
                kt_nghi,
                loai_np,
                ca_nghi,
                link
            } = req.body;
            let id_user = req.user.data.idQLC
            let com_id = req.user.data.inForPerson.employee.com_id
            let name_user = req.user.data.userName
            let file_kem = req.files.fileKem;
            let link_download = '';

            if (file_kem) {
                functions.uploadFileVanThu(id_user, file_kem);
                link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
            }
            if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
                return res.status(404).json("bad request ");
            } else {
                let maxID = 0;
                const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
                //   console.log(de_xuat);
                if (de_xuat) {
                    maxID = de_xuat._id;
                }
                //console.log("mx : " + maxID);
                const new_de_xuat = new De_Xuat({
                    _id: (maxID + 1),
                    name_dx: name_dx,
                    type_dx: 1,
                    phong_ban: phong_ban,
                    noi_dung: {
                        nghi_phep: {
                            ly_do: ly_do,
                            bd_nghi: bd_nghi,
                            kt_nghi: kt_nghi,
                            loai_np: loai_np,
                            ca_nghi: ca_nghi,
                        }
                    },
                    name_user: name_user,
                    id_user: id_user,
                    com_id: com_id,
                    kieu_duyet: kieu_duyet,
                    id_user_duyet: id_user_duyet,
                    id_user_theo_doi: id_user_theo_doi,
                    file_kem: link_download,
                    kieu_duyet: 0,
                    //   type_duyet: 0,
                    //  type_time: type_time,
                    //time_start_out: " ",
                    time_create: new Date(),
                    //  time_tiep_nhan: null,
                    //  time_duyet: null,
                    // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                    // del_type: 1,//1-active , 2 --delete
                });
                let saveDX = await new_de_xuat.save();
                functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
                // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
                maxID = 0;
                const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
                console.log(tb);
                if (tb) {
                    maxID = Number(tb._id);
                }
                const id_user_nhan_arr = id_user_duyet.split(',');

                let createTBs = []; // Mảng chứa các đối tượng ThongBao

                for (let i = 0; i < id_user_nhan_arr.length; i++) {
                    const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                    let createTB = new ThongBao({
                        _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                        id_user: id_user,
                        id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                        id_van_ban: saveDX._id,
                        type: 2,
                        view: 0,
                        created_date: new Date()
                    });

                    createTBs.push(createTB);
                }

                // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
                let saveCreateTb = await ThongBao.insertMany(createTBs)
                return res.status(200).json(saveDX, saveCreateTb);
            }
        } catch (error) {
            console.error('Failed to add', error);
            res.status(500).json({ error: 'Failed to add' });
        }
    }
    //đề xuất bổ nhiệm 
exports.de_xuat_xin_bo_nhiem = async(req, res) => {
    try {
        let {
            name_dx,
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            ly_do,
            thanhviendc_bn,
            name_ph_bn,
            chucvu_hientai,
            chucvu_dx_bn,
            phong_ban_moi,
            phong_ban,
            link
        } = req.body;

        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }

        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");

        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }

            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 7,
                noi_dung: {
                    bo_nhiem: {
                        ly_do: ly_do,
                        thanhviendc_bn: thanhviendc_bn,
                        name_ph_bn: name_ph_bn,
                        chucvu_hientai: chucvu_hientai,
                        chucvu_dx_bn: chucvu_dx_bn,
                        phong_ban_moi: phong_ban_moi
                    }

                },
                name_user: name_user,
                phong_ban: phong_ban,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: 0,
                // type_duyet: 0,
                // type_time: 0,
                //  time_start_out: " ",
                time_create: new Date(),
                //  time_tiep_nhan: null,
                //  time_duyet: null,
                //  active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                //   del_type: 1,//1-active , 2 --delete
            })


            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "dề xuất bổ nhệm ", link, file_kem);
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date(),
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json({ saveCreateTb, saveDX });

        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }



}


//đề xuất cấp phát tài sản
exports.de_xuat_xin_cap_phat_tai_san = async(req, res) => {
    try {
        let {
            name_dx,
            //  type_dx,//int 
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            //  file_kem,
            ly_do,
            phong_ban,
            //  type_time,
            danh_sach_tai_san,
            so_luong_tai_san,
            link

        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }


        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");

        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }

            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 4,
                noi_dung: {
                    cap_phat_tai_san: {
                        ly_do: ly_do,
                        danh_sach_tai_san: danh_sach_tai_san,
                        so_luong_tai_san: (so_luong_tai_san),
                    }

                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,

                phong_ban: phong_ban,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: kieu_duyet,
                //  type_duyet: 0,
                //  type_time: type_time,
                // time_start_out: " ",
                time_create: new Date(),
                time_tiep_nhan: null,
                time_duyet: null,
                active: 0, //1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                del_type: 1, //1-active , 2 --delete
            })
            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            maxID = 0;
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date(),
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json(saveDX, saveCreateTb);
        }


    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }

}

//đề xuất đổi ca 
exports.de_xuat_doi_ca = async(req, res) => {
    try {
        let {
            name_dx,
            //  type_dx,//int 
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            // file_kem,
            ly_do,
            phong_ban,
            ngay_can_doi,
            ca_can_doi,
            ngay_muon_doi,
            ca_muon_doi,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");

        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }

            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 2,
                noi_dung: {
                    doi_ca: {
                        ngay_can_doi: ngay_can_doi,
                        ca_can_doi: ca_can_doi,
                        ngay_muon_doi: ngay_muon_doi,
                        ca_muon_doi: ca_muon_doi,
                        ly_do: ly_do
                    }
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                phong_ban: phong_ban,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: kieu_duyet,
                //  type_duyet: 0,
                //  type_time: 0,
                //  time_start_out: " ",
                time_create: new Date(),
                // time_tiep_nhan: null,
                // time_duyet: null,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                //   del_type: 1,//1-active , 2 --delete
            })


            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            maxID = 0;
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date(),
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json(saveDX, saveCreateTb);
        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }



}


//đề xuất luân chuyển công tác 
exports.de_xuat_luan_chuyen_cong_tac = async(req, res) => {
    try {
        let {
            name_dx,
            // type_dx,//int 
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            // file_kem,
            ly_do,

            cv_nguoi_lc,
            pb_nguoi_lc,
            noi_cong_tac,
            noi_chuyen_den,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");

        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }

            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 8,
                noi_dung: {
                    luan_chuyen_cong_tac: {
                        cv_nguoi_lc: cv_nguoi_lc,
                        pb_nguoi_lc: pb_nguoi_lc,
                        ly_do: ly_do,
                        noi_cong_tac: noi_cong_tac,
                        noi_chuyen_den: noi_chuyen_den
                    }

                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: kieu_duyet,
                // type_duyet: 0,
                //  type_time: 0,
                //   time_start_out: " ",
                time_create: new Date(),
                //   time_tiep_nhan: null,
                //   time_duyet: null,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                //   del_type: 1,//1-active , 2 --delete
            })


            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            maxID = 0;
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date,
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json(saveDX, saveCreateTb);
        }

    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }


}

//đề xuất tăng lương 
exports.de_xuat_tang_luong = async(req, res) => {
    try {
        let {
            name_dx,
            //  type_dx,//int 
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            //  file_kem,
            ly_do,

            mucluong_ht,
            mucluong_tang,
            date_tang_luong,
            link


        } = req.body;

        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");

        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }

            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 6,
                noi_dung: {
                    tang_luong: {
                        mucluong_ht: mucluong_ht,
                        mucluong_tang: mucluong_tang,
                        date_tang_luong: date_tang_luong,
                        ly_do: ly_do
                    }
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: kieu_duyet,
                //  type_duyet: 0,
                type_time: 0,
                // time_start_out: " ",
                time_create: new Date(),
                // time_tiep_nhan: 0,
                // time_duyet: 0,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                //  del_type: 1,//1-active , 2 --delete
            })


            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            maxID = 0;
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date()
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json(saveDX, saveCreateTb);
        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }


}

//đè xuất tham gia dự ấn 
exports.de_xuat_tham_gia_du_an = async(req, res) => {
    try {
        let {
            name_dx,
            //  type_dx,//int 
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            //  file_kem,
            ly_do,

            cv_nguoi_da,
            pb_nguoi_da,
            dx_da,
            link



        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");

        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }


            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 9,
                noi_dung: {
                    tham_gia_du_an: {
                        ly_do: ly_do,
                        cv_nguoi_da: cv_nguoi_da,
                        pb_nguoi_da: pb_nguoi_da,
                        dx_da: dx_da,
                    }

                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: 0,
                type_duyet: 0,
                //  type_time: 0,
                //  time_start_out: " ",
                time_create: new Date(),
                // time_tiep_nhan: null,
                // time_duyet: null,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                /// del_type: 1,//1-active , 2 --delete
            })


            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            maxID = 0;
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date()
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json(saveDX, saveCreateTb);

        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }



}

//đề xuất xin tạm ứng lương
exports.de_xuat_xin_tam_ung = async(req, res) => {
    try {
        let {
            name_dx,
            //  type_dx,//int 
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            //   file_kem,

            ly_do,
            tien_tam_ung,
            ngay_tam_ung,
            link


        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");

        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }

            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 3,
                noi_dung: {
                    tam_ung: {
                        ly_do: ly_do,
                        tien_tam_ung: tien_tam_ung,
                        ngay_tam_ung: ngay_tam_ung
                    }

                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: 0,
                type_duyet: 0,
                type_time: 0,
                // time_start_out: " ",
                time_create: new Date(),
                // time_tiep_nhan: null,
                //time_duyet: null,
                active: 1, //1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                del_type: 1, //1-active , 2 --delete
            })


            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            maxID = 0;
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date()
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json(saveDX, saveCreateTb);

        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }



}

//đề xuất thôi việc 
exports.de_xuat_xin_thoi_Viec = async(req, res) => {
    try {
        let {
            name_dx,
            // type_dx,//int 
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            //  file_kem,
            ly_do,

            ngaybatdau_tv,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }

        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");

        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }

            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 5,
                noi_dung: {
                    thoi_viec: {
                        ly_do: ly_do,
                        ngaybatdau_tv: ngaybatdau_tv,

                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: kieu_duyet,
                //type_duyet: 0,
                // type_time: 0,
                //time_start_out: " ",
                time_create: new Date(),
                //  time_tiep_nhan: null,
                //  time_duyet: null,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                //  del_type: 1,//1-active , 2 --delete
            });


            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            maxID = 0;
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json(saveDX, saveCreateTb);
        }

    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }


}


exports.lich_lam_viec = async(req, res) => {
    try {
        let {
            name_dx,
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            ly_do,


            lich_lam_viec,
            thang_ap_dung,
            ngay_bat_dau,
            ca_lam_viec,
            ngay_lam_viec,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        if (isNaN(id_user) || isNaN(id_user_duyet) || isNaN(id_user_theo_doi)) {
            return res.status(404).json({ message: "bad request" });
        } else {

            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            //   console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }

            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 18,
                noi_dung: {
                    lich_lam_viec: {
                        ly_do: ly_do,
                        lich_lam_viec: lich_lam_viec,
                        thang_ap_dung: thang_ap_dung,
                        ngay_bat_dau: ngay_bat_dau,
                        ca_la_viec: ca_lam_viec,
                        ngay_lam_viec: ngay_lam_viec,


                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                kieu_duyet: kieu_duyet,
                //type_duyet: 0,
                // type_time: 0,
                //time_start_out: " ",
                time_create: new Date(),
                //  time_tiep_nhan: null,
                //  time_duyet: null,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                //  del_type: 1,//1-active , 2 --delete
            });

            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            maxID = 0;
            const tb = await thongBao.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            console.log(tb);
            if (tb) {
                maxID = Number(tb._id);
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date()
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json(saveDX, saveCreateTb);
        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }


}

exports.dxCong = async(req, res) => {
    try {
        let {
            name_dx,
            noi_dung,
            kieu_duyet,
            id_user,
            com_id,
            name_user,
            id_user_duyet,
            id_user_theo_doi,
            ca_xnc,
            time_xnc,
            ly_do,
            link
        } = req.body;
        // let id_user = req.user.data.idQLC
        // let com_id = req.user.data.inForPerson.employee.com_id
        // let name_user = req.user.data.userName
        let createDate = new Date();
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (linkDL) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXC = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 17,
                noi_dung: {
                    xac_nhan_cong: {
                        time_xnc: time_xnc,
                        ca_xnc: ca_xnc,
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                time_create: createDate,
            });
            let savedDXC = await createDXC.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao);
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXC.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXC._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            res.status(200).json({ saveCreateTb, savedDXC })
        };

    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxCoSoVatChat = async(req, res) => {
    try {
        let {
            name_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            time_start_out,
            input_csv,
            ly_do,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName;
        let createDate = new Date()
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {
                _id = Number(maxID) + 1;
            }
            let createDXCSVC = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 14,
                noi_dung: {
                    sua_chua_co_so_vat_chat: {
                        input_csv: input_csv,
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                time_start_out: time_start_out,
                time_create: createDate,

            });
            let savedDXCSVC = await createDXCSVC.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXCSVC._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            res.status(200).json({ savedDXCSVC, saveCreateTb });
        };



    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxDangKiSuDungXe = async(req, res) => {
    try {
        let {
            name_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            bd_xe,
            end_xe,
            soluong_xe,
            local_di,
            local_den,
            ly_do,
            link

        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let createDate = new Date()
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {
                _id = Number(maxID) + 1;
            }
            let createDXXe = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 13,
                noi_dung: {
                    su_dung_xe_cong: {
                        bd_xe: bd_xe,
                        end_xe: end_xe,
                        soluong_xe: soluong_xe,
                        local_di: local_di,
                        local_den: local_den,
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,
            });

            let savedDXXe = await createDXXe.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXXe._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            res.status(200).json({ savedDXXe, saveCreateTb });
        };



    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxHoaHong = async(req, res) => {
    try {
        let {
            name_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            chu_ky,
            doanh_thu_td,
            muc_doanh_thu,
            ly_do,
            time_hh,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let createDate = new Date()
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXHH = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 20,
                noi_dung: {
                    hoa_hong: {
                        chu_ky: chu_ky,
                        time_hh: time_hh,
                        doanh_thu_td: doanh_thu_td,
                        muc_doanh_thu: muc_doanh_thu,
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,
            });

            let savedDXHH = await createDXHH.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXHH.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXHH._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            res.status(200).json({ savedDXHH, saveCreateTb });
        };
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxKhieuNai = async(req, res) => {
    try {
        let {
            name_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            ly_do,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let createDate = new Date()
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXKN = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 16,
                noi_dung: {
                    khieu_nai: {
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,
            });

            let savedDXKN = await createDXKN.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXKN.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXKN._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)

            res.status(200).json({ savedDXKN, saveCreateTb });
        };



    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxPhongHop = async(req, res) => {
    try {
        let {
            name_dx,
            type_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            bd_hop,
            end_hop,
            ly_do,
            link
        } = req.body;
        let createDate = new Date()
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName;
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXPH = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 12,
                noi_dung: {
                    su_dung_phong_hop: {
                        bd_hop: bd_hop,
                        end_hop: end_hop,
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,

            });

            let savedDXPH = await createDXPH.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXPH.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXPH._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)

            res.status(200).json({ savedDXPH, saveCreateTb });
        };


    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxTangCa = async(req, res) => {
    try {
        let {
            name_dx,
            type_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            ly_do,
            time_tc,
            time_end_tc,
            link
        } = req.body;
        let createDate = new Date()
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName;
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {

            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXTC = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 10,
                noi_dung: {
                    tang_ca: {
                        ly_do: ly_do,
                        time_tc: time_tc,
                        time_end_tc: time_end_tc
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,
            });

            let savedDXTC = await createDXTC.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXTC.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXTC._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)

            res.status(200).json({ savedDXTC, saveCreateTb });
        };



    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxThaiSan = async(req, res) => {
    try {
        let {
            name_dx,
            type_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            ngaybatdau_nghi_ts,
            ngayketthuc_nghi_ts,
            ly_do,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let createDate = new Date();
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXTS = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 11,
                noi_dung: {
                    nghi_thai_san: {
                        ngaybatdau_nghi_ts: ngaybatdau_nghi_ts,
                        ngayketthuc_nghi_ts: ngayketthuc_nghi_ts,
                        ly_do: ly_do
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,
            });

            let savedDXTS = await createDXTS.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXTS.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXTS._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            res.status(200).json({ savedDXTS, saveCreateTb });
        };



    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxThanhToan = async(req, res) => {
    try {
        let {
            name_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            so_tien_tt,
            ly_do,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName
        let createDate = new Date()
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {

            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXTT = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 15,
                noi_dung: {
                    thanh_toan: {
                        so_tien_tt: so_tien_tt,
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,
            });

            let savedDXTT = await createDXTT.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXTT.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXTT._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            res.status(200).json({ savedDXTT, saveCreateTb });
        };

    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxThuongPhat = async(req, res) => {
    try {
        let {
            name_dx,
            type_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            type_tp,
            so_tien_tp,
            nguoi_tp,
            time_tp,
            ly_do,
            link
        } = req.body;
        let createDate = new Date()
        let id_user = req.user.data.idQLC
        let com_id = req.user.data.inForPerson.employee.com_id
        let name_user = req.user.data.userName;
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            await functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXTP = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 19,
                noi_dung: {
                    thuong_phat: {
                        so_tien_tp: so_tien_tp,
                        nguoi_tp: nguoi_tp,
                        time_tp: time_tp,
                        type_tp: type_tp,
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,
            });

            let savedDXTP = await createDXTP.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "đề xuất lịch làm việc", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXTP.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXTP._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)

            res.status(200).json({ savedDXTP, saveCreateTb });
        };

    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxDiMuonVeSom = async(req, res) => {
    try {
        let {
            name_dx,
            type_dx,
            noi_dung,
            kieu_duyet,
            id_user_duyet,
            id_user_theo_doi,
            type_duyet,
            link,

            time_batdau,
            time_batdau_tomorrow,
            time_ketthuc,
            time_ketthuc_tomorrow,
            ca_lam_viec,
            ly_do
        } = req.body;
        let createDate = new Date()
        let id_user = req.user.data.idQLC
        let com_id = -1;
        if (req.user.data.inForPerson && req.user.data.inForPerson.employee) {
            com_id = req.user.data.inForPerson.employee.com_id
        }
        let name_user = req.user.data.userName;
        let file_kem = req.files.file_kem;
        let linkDL = '';
        if (file_kem) {
            console.log("Hit filekem")
            functions.uploadFileVanThu(id_user, file_kem);
            linkDL = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        console.log("Hit DX2")
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json('bad request')
        } else {
            let maxID = await functions.getMaxID(DeXuat);
            let _id = 0;
            if (maxID) {

                _id = Number(maxID) + 1;
            }
            let createDXDMVS = new DeXuat({
                _id: _id,
                name_dx: name_dx,
                type_dx: 21,
                noi_dung: {
                    di_muon_ve_som: {
                        time_batdau: time_batdau,
                        time_batdau_tomorrow: time_batdau_tomorrow,
                        time_ketthuc: time_ketthuc,
                        time_ketthuc_tomorrow: time_ketthuc_tomorrow,
                        ca_lam_viec: ca_lam_viec,
                        ly_do: ly_do,
                    },
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: linkDL,
                type_duyet: type_duyet,
                time_create: createDate,
            });

            let savedDXDMVS = await createDXDMVS.save();
            console.log(savedDXDMVS)
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Đề xuất đi muộn về sớm", link);
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = savedDXDMVS.id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: savedDXDMVS._id,
                    type: 2,
                    view: 0,
                    created_date: createDate
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)

            res.status(200).json({ savedDXDMVS: savedDXDMVS, saveCreateTb });
        };
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

//đề xuất xin nghỉ phép ra ngoài
exports.dxXinNghiRaNgoai = async(req, res) => {
    try {
        let {
            name_dx,
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            phong_ban,
            ly_do,
            bd_nghi,
            kt_nghi,
            ca_nghi,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = -1;
        if (req.user.data.inForPerson && req.user.data.inForPerson.employee) {
            com_id = req.user.data.inForPerson.employee.com_id
        }
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';

        if (file_kem) {
            functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");
        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            //   console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }
            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 1,
                phong_ban: phong_ban,
                noi_dung: {
                    nghi_phep_ra_ngoai: {
                        ly_do: ly_do,
                        bd_nghi: bd_nghi,
                        kt_nghi: kt_nghi,
                        ca_nghi: ca_nghi,
                    }
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: 0,
                //   type_duyet: 0,
                //  type_time: type_time,
                //time_start_out: " ",
                time_create: new Date(),
                //  time_tiep_nhan: null,
                //  time_duyet: null,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                // del_type: 1,//1-active , 2 --delete
            });
            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin nghỉ phép", link, file_kem);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date()
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json({ saveDX, saveCreateTb });
        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxNhapNgayNhanLuong = async(req, res) => {
    try {
        let {
            name_dx,
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            phong_ban,
            ngay_nhan_luong,
            ly_do,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = -1;
        if (req.user.data.inForPerson && req.user.data.inForPerson.employee) {
            com_id = req.user.data.inForPerson.employee.com_id
        }
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';

        if (file_kem) {
            functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");
        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            //   console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }
            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 1,
                phong_ban: phong_ban,
                noi_dung: {
                    nhap_ngay_nhan_luong: {
                        ly_do: ly_do,
                        ngay_nhan_luong: ngay_nhan_luong
                    }
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: 0,
                //   type_duyet: 0,
                //  type_time: type_time,
                //time_start_out: " ",
                time_create: new Date(),
                //  time_tiep_nhan: null,
                //  time_duyet: null,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                // del_type: 1,//1-active , 2 --delete
            });
            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Nhập ngày nhận lương", link);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date()
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json({ saveDX, saveCreateTb });
        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}

exports.dxXinTaiTaiLieu = async(req, res) => {
    try {
        let {
            name_dx,
            kieu_duyet, // 0-kiểm duyệt lần lượt hay đồng thời 
            id_user_duyet,
            id_user_theo_doi,
            phong_ban,
            ten_tai_lieu,
            ly_do,
            link
        } = req.body;
        let id_user = req.user.data.idQLC
        let com_id = -1;
        if (req.user.data.inForPerson && req.user.data.inForPerson.employee) {
            com_id = req.user.data.inForPerson.employee.com_id
        }
        let name_user = req.user.data.userName
        let file_kem = req.files.fileKem;
        let link_download = '';

        if (file_kem) {
            functions.uploadFileVanThu(id_user, file_kem);
            link_download = functions.createLinkFileVanthu(id_user, file_kem.name);
        }
        if (!name_dx || !name_user || !id_user || !id_user_duyet || !id_user_theo_doi) {
            return res.status(404).json("bad request ");
        } else {
            let maxID = 0;
            const de_xuat = await De_Xuat.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
            //   console.log(de_xuat);
            if (de_xuat) {
                maxID = de_xuat._id;
            }
            //console.log("mx : " + maxID);
            const new_de_xuat = new De_Xuat({
                _id: (maxID + 1),
                name_dx: name_dx,
                type_dx: 1,
                phong_ban: phong_ban,
                noi_dung: {
                    xin_tai_tai_lieu: {
                        ly_do: ly_do,
                        ten_tai_lieu: ten_tai_lieu
                    }
                },
                name_user: name_user,
                id_user: id_user,
                com_id: com_id,
                kieu_duyet: kieu_duyet,
                id_user_duyet: id_user_duyet,
                id_user_theo_doi: id_user_theo_doi,
                file_kem: link_download,
                kieu_duyet: 0,
                //   type_duyet: 0,
                //  type_time: type_time,
                //time_start_out: " ",
                time_create: new Date(),
                //  time_tiep_nhan: null,
                //  time_duyet: null,
                // active: 1,//1-bên 3 đã đồng ý , 2 - bên 3 không đồng ý 
                // del_type: 1,//1-active , 2 --delete
            });
            let saveDX = await new_de_xuat.save();
            functions.chat(id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, "Xin tải tài liệu", link);
            // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link,file_kem
            let maxIDTB = await functions.getMaxID(ThongBao)
            let idTB = 0;
            if (maxIDTB) {
                idTB = Number(maxIDTB) + 1;
            }
            const id_user_nhan_arr = id_user_duyet.split(',');

            let createTBs = []; // Mảng chứa các đối tượng ThongBao

            for (let i = 0; i < id_user_nhan_arr.length; i++) {
                const id_user_nhan = parseInt(id_user_nhan_arr[i]);

                let createTB = new ThongBao({
                    _id: idTB + i, // Sử dụng idTB + i để tạo id duy nhất cho mỗi đối tượng ThongBao
                    id_user: id_user,
                    id_user_nhan: id_user_nhan, // Lưu giá trị từng phần tử của id_user_duyet dưới dạng số
                    id_van_ban: saveDX._id,
                    type: 2,
                    view: 0,
                    created_date: new Date()
                });

                createTBs.push(createTB);
            }

            // Lưu tất cả các đối tượng ThongBao vào cơ sở dữ liệu
            let saveCreateTb = await ThongBao.insertMany(createTBs)
            return res.status(200).json({ saveDX, saveCreateTb });
        }
    } catch (error) {
        console.error('Failed to add', error);
        res.status(500).json({ error: 'Failed to add' });
    }
}