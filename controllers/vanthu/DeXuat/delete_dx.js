
const De_Xuat = require('../../../models/Vanthu/de_xuat');
const delete_Dx = require('../../../models/Vanthu/delete_dx');
const his_handle = require('../../../models/Vanthu/history_handling_dx');


// hàm khi người dùng ấn hủy tiếp nhận hoặc từ chối
exports.delete_dx = async (req, res) => {
    try {
        let id_user = req.user.data.idQLC;
        console.log(id_user);
        let id = req.body.id;
        console.log("id la :  " + id);
        let de_xuat = [];
        if (!isNaN(id)) {
            de_xuat = await De_Xuat.findOne({ _id: id });

            if (!de_xuat) {
                return res.status(200).json("de xuat khong ton tai");
            } else {

                // lưu vào bảng deletedx
                let maxID = 0;
                const dx = await delete_Dx.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
                console.log(dx);
                if (dx) {
                    maxID = dx.id_del;
                }

                let del_dx = new delete_Dx({
                    id_del: maxID + 1,
                    user_del: id_user,
                    user_del_com: de_xuat.com_id,
                    id_dx_del: id,
                    time_del: Date.now()

                });
                await del_dx.save();// lưu vao bang del_dx


                //lưu vào bảng history handlingdx
                const max_hisHandle = await his_handle.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
                if (max_hisHandle) {
                    maxID = max_hisHandle.id_his;
                }
                let his_handel_duyet = new his_handle({
                    id_his: maxID + 1,
                    id_dx: id,
                    id_user: id_user,
                    type_handling: 3,//2- đồng ý // 3- hủy duyệt //1-xác nhận
                    time: new Date()
                });
                await his_handel_duyet.save()// lưu trạng thái xử lí vào bảng his_handle;

                // Sửa đổi trang thái dx trong bảng đề xuất del_type từ 1 -> 2
                await De_Xuat.findOneAndUpdate({ _id: id }, {
                    del_type: 2,
                    active: 2,
                    delete_Dx: Date.now(),
                    type_duyet: 3
                });
                return res.status(200).json({ data: del_dx, message: 'xoa thanh cong ' });
            }
        } else {
            return res.status(404).json("id phai la 1 so Number");
        }
    } catch (error) {
        console.error('Failed to add delete', error);
        res.status(500).json({ error: 'Failed to add delete' });
    }

}


//hiển thị đề xuất đã xóa + tìm kiếm
exports.de_xuat_da_xoa_All = async (req, res) => {
    try {
        let {
            phong_ban,
            id_nhan_vien,
            loai_de_xuat,
            trang_thai_de_xuat } = req.body;
        let filter = {};
        if (phong_ban) { filter.phong_ban = phong_ban };

        if (id_nhan_vien) { filter.id_user = id_nhan_vien };
        if (loai_de_xuat) { filter.type_dx };
        if (trang_thai_de_xuat) { filter.type_duyet };
        let id_user_duyet = req.body.id_user_duyet;
        if (!isNaN(id_user_duyet)) {
            let de_xuat_da_xoa = [];
            let his_delete = await delete_Dx.find({ user_del: id_user_duyet });
            for (let i = 0; i < his_delete.length; i++) {
                filter._id = his_delete[i].id_dx_del;
                let de_xuat = await De_Xuat.findOne(filter);
                if (de_xuat.del_type == 2) {
                    let info_dx = {
                        id: de_xuat._id,
                        name_user: de_xuat.name_user,
                        name_dx: de_xuat.name_dx,
                        status: de_xuat.type_time,
                        time_del: his_delete.time_del
                    }
                    de_xuat_da_xoa.push(info_dx);
                }
            }
            return res.status(200).json({ data: de_xuat_da_xoa, message: "thanh cong " });

        } else {
            return res.status(404).json({ message: "bad request" });
        }
    } catch (error) {
        console.error('Failed to show ', error);
        res.status(500).json({ error: 'Failed to show ' });
    }
}


exports.khoi_phuc = async (req, res) => {
    try {

        let id = req.body.id;
        // console.log(typeof id);
        // return;
        if (id) {
            let list_id_dx = id.split(',');

            for (let i = 0; i < list_id_dx.length; i++) {
                await De_Xuat.findByIdAndUpdate({ _id: list_id_dx[i] }, { del_type: 1 });
                await delete_Dx.deleteMany({ id_dx_del: list_id_dx[i] });
            }
            return res.status(200).json({ message: 'success' });
        } else {
            return res.status(404).json({ message: 'bad request' });
        }
    } catch (error) {
        console.error('Failed  ', error);
        res.status(500).json({ error: 'Failed  ' });
    }

}




exports.xoa_vinh_vien = async (req, res) => {
    try {
        let _id = req.body.id;
        let id_user = req.user.data.idQLC;
        let de_xuat_da_xoa = [];
        if (!isNaN(_id)) {
            let list_id_dx = _id.split(",");
            for (let i = 0; i < list_id_dx.length; i++) {
                await delete_Dx.deleteOne({ id_dx_del: list_id_dx[i] });
            }
            let his_delete = await delete_Dx.find({ user_del: id_user });
            for (let i = 0; i < his_delete.length; i++) {
                let de_xuat = await De_Xuat.findOne({ _id: his_delete[i].id_dx_del });
                if (de_xuat.del_type == 2) {
                    let info_dx = {
                        id: de_xuat._id,
                        name_user: de_xuat.name_user,
                        name_dx: de_xuat.name_dx,
                        status: de_xuat.active,
                        time_del: his_delete.time_del
                    }
                    de_xuat_da_xoa.push(info_dx);
                }
                console.log(de_xuat_da_xoa);
            }
            return res.status(200).json({ data: de_xuat_da_xoa, message: 'success' });
        } else {
            return res.status(200).json({ message: 'bad request' });
        }
    } catch (error) {
        console.error('Failed to delete ', error);
        res.status(500).json({ error: 'Failed to delete  ' });
    }

}   