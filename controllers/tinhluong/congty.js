const NhanVienService = require('../../services/tinhluong/nhanvien');
const Tinhluong365EmpStart = require('../../models/Tinhluong/Tinhluong365EmpStart')
const Tinhluong365Contract = require('../../models/Tinhluong/Tinhluong365Contract')
const TinhluongDonate = require('../../models/Tinhluong/TinhluongDonate')
const TinhluongListClass = require('../../models/Tinhluong/TinhluongListClass')
const Tinhluong365SalaryBasic = require('../../models/Tinhluong/Tinhluong365SalaryBasic')
const Tinhluong365ThuongPhat = require('../../models/Tinhluong/Tinhluong365ThuongPhat')
const Tinhluong365Family = require('../../models/Tinhluong/TinhluongFamily');
const TinhluongPhatCa = require('../../models/Tinhluong/TinhluongPhatCa');
const CC365_TimeSheet = require('../../models/Chamcong/CC365_TimeSheet');
const TinhluongPhatMuon = require('../../models/Tinhluong/TinhluongPhatMuon');
const TinhluongClass = require('../../models/Tinhluong/TinhluongClass');
const TinhluongRose = require('../../models/Tinhluong/TinhluongRose');
const TinhluongThietLap = require('../../models/Tinhluong/TinhluongThietLap');
const Shift = require('../../models/Chamcong/Shifts');
const TinhluongPercentGr = require('../../models/Tinhluong/TinhluongPercentGr');
const User = require('../../models/Users');
const Counter = require('../../models/Counter');
const TinhluongGroup = require('../../models/Tinhluong/TinhluongGroup')
const TinhluongListGroup = require('../../models/Tinhluong/TinhluongListGroup');
const TinhluongWelfareShift = require('../../models/Tinhluong/TinhluongWelfareShift')
const TinhluongListRose = require('../../models/Tinhluong/TinhluongListRose')
const TinhluongFormSalary = require('../../models/Tinhluong/TinhluongFormSalary')
const TinhluongPayment = require('../../models/Tinhluong/TinhluongPayment')
const TinhluongDetailPayment = require('../../models/Tinhluong/TinhluongDetailPayment')
const TinhluongListNghiPhep = require('../../models/Tinhluong/TinhluongListNghiPhep')
const TinhluongForm = require('../../models/Tinhluong/TinhluongForm');
const de_xuat = require('../../models/Vanthu/de_xuat');
// quan-ly-nhan-su
// danh sách nhân viên chưa có lịch làm việc 
exports.list_em_no_job= async (req, res) => {
    try{
        const id_com = Number(req.body.id_com);
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date);
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));
        let listUser = await User.find(
            {"inForPerson.employee.com_id":id_com},
            {idQLC:1}
        ).lean();
        let array = [];
        for(let i = 0; i < listUser.length; i++) {
            array.push(listUser[i].idQLC)
        }

        let list_data_circle = await NhanVienService.get_circle_listem(array,id_com,start_date,end_date);
        array = array.filter((e)=> !list_data_circle.find((a)=> a.ep_id == e ));
        let list_em_no_job = await User.find({idQLC:{$in:array}},{password:0}).lean();
        return res.status(200).json({ data: {
            list_em_no_job
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.list_em= async (req, res) => {
    try{
        const id_com = Number(req.body.id_com);
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date);
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));
        let listUser = await User.find(
            {"inForPerson.employee.com_id":id_com},
            {
                password:0,
                configChat:0,
                "inForPerson.employee.ep_featured_recognition":0
            }
        ).lean();
        return res.status(200).json({ data: {
            listUser
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lương cơ bản 
exports.insert_basic_salary= async (req, res) => {
    try{
        // sb_id_user,sb_id_com,sb_salary_basic,sb_time_up
        const sb_id_user = Number(req.body.sb_id_user);
        const sb_id_com = Number(req.body.sb_id_com);
        const sb_salary_basic = Number(req.body.sb_salary_basic);
        const sb_time_up = new Date(req.body.sb_time_up);
        const sb_lydo = String(req.body.sb_lydo);
        const sb_quyetdinh = String(req.body.sb_quyetdinh);
        let obj = new Tinhluong365SalaryBasic({
            sb_id_user,
            sb_id_com,
            sb_salary_basic,
            sb_time_up,
            sb_lydo,
            sb_quyetdinh
        });
        let newobj = await obj.save();
        return res.status(200).json({ data: {
            newobj
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.delete_basic_salary= async (req, res) => {
    try{
        // sb_id_user,sb_id_com,sb_salary_basic,sb_time_up
        const sb_id = Number(req.body.sb_id);
        await Tinhluong365SalaryBasic.deleteOne({sb_id:sb_id})
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.update_basic_salary= async (req, res) => {
    try{
        // sb_id_user,sb_id_com,sb_salary_basic,sb_time_up
        const sb_id = Number(req.body.sb_id);
        const sb_salary_basic = Number(req.body.sb_salary_basic);
        const sb_lydo = String(req.body.sb_lydo);
        const sb_quyetdinh = String(req.body.sb_quyetdinh);

        await Tinhluong365SalaryBasic.updateOne({sb_id:sb_id},{
            $set:{
                sb_salary_basic,
                sb_lydo,
                sb_quyetdinh
            }
        })
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
exports.take_salary_contract= async (req, res) => {
    try{
        // thời điểm lớn hơn thời điểm bắt đầu hợp đồng 
        const time = new Date(req.body.time);
        const array = JSON.parse(req.body.array);
        let arr = [];
        for(let i=0; i<array.length; i++){
            if(array[i]){
                arr.push(Number(array[i]));
            }
        }
        let data_salary = await Tinhluong365SalaryBasic.find(
            {
                sb_id_user:{$in:arr},
                sb_time_up:{$lte:time}
            },
            {
                sb_salary_basic:1,
                sb_time_up:1,
                sb_id_user:1
            }
        ).sort({sb_salary_basic:-1}).lean();
        let data_contract = await Tinhluong365Contract.find(
            {
                con_id_user:{$in:arr},
                con_time_up:{$lte:time}
            },
            {
                con_salary_persent:1,
                con_time_up:1,
                con_id_user:1
            }
        ).sort({con_time_up:-1}).lean();
        let data_final = [];
        for(let i = 0; i < data_contract.length; i++){
            let userId = data_contract[i].con_id_user;
            if(!data_final.find((e)=> e.userId == userId)){
               let salary_info = data_salary.find((e)=> e.sb_id_user == userId);
               if(salary_info){
                   data_final.push({
                      userId,
                      con_salary_persent:Number(data_contract[i].con_salary_persent),
                      sb_salary_basic:salary_info.sb_salary_basic
                   })
               }
            }
        }
        return res.status(200).json({ data: data_final, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.take_salary_em= async (req, res) => {
    try{
        const ep_id = Number(req.body.ep_id);
        // sắp xếp theo thời gian bắt đầu 
        let data_salary = await Tinhluong365SalaryBasic.find(
            {
                sb_id_user:ep_id,
            }
        ).sort({sb_time_up:-1}).lean();
        let data_contract = await Tinhluong365Contract.find(
            {
                con_id_user:ep_id
            }
        ).sort({con_time_up:-1}).lean();
        return res.status(200).json({ data: {
            data_salary,
            data_contract
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// dữ liệu tính lương 
// dữ liệu chấm công nhân viên 

// gọi sang chấm công 
// curl_setopt($curl, CURLOPT_URL, "https://chamcong.24hpay.vn/service/list_all_employee_of_company.php?filter_by[active]=" . $active . "&" . $fil);


// thưởng phạt 
exports.take_thuong_phat= async (req, res) => {
    try{
        const month = Number(req.body.month);
        const year = Number(req.body.year);
        const id_com = Number(req.body.id_com);
        // let listUser = await User.find(
        //     {"inForPerson.employee.com_id":id_com},
        //     {idQLC:1}
        // ).lean();
        // let arr = [];
        // for(let i = 0; i < listUser.length; i++) {
        //     arr.push(listUser[i].idQLC)
        // }
        let data_thuong = await Tinhluong365ThuongPhat.aggregate(
            [
                {
                    $match:{
                        $and:[
                            {pay_id_com:id_com},
                            {pay_status:1},
                            {pay_year:year},
                            {pay_month:month}
                        ]
                    }
                },
                { 
                    $group: {_id:"$pay_id_user", sum_thuong:{$sum:"$pay_price"}}
                }
            ]
        );
        
        let data_phat = await Tinhluong365ThuongPhat.aggregate(
            [
                {
                    $match:{
                        $and:[
                            {pay_id_com:id_com},
                            {pay_status:2},
                            {pay_year:year},
                            {pay_month:month}
                        ]
                    }
                },
                { 
                    $group: {_id:"$pay_id_user", sum_phat:{$sum:"$pay_price"}}
                }
            ]
        );
        let listUserId = [];
        for(let i = 0; i < data_phat.length; i++){
            listUserId.push(data_phat[i]._id);
        }
        for(let i = 0; i < data_thuong.length; i++){
            listUserId.push(data_thuong[i]._id);
        };
        let listUser = await User.find({idQLC:{$in:listUserId}},{password:0}).lean();
        let data_thuong_detail = await Tinhluong365ThuongPhat.aggregate(
            [
                {
                    $match:{
                        $and:[
                            {pay_id_com:id_com},
                            {pay_status:1},
                            {pay_year:year},
                            {pay_month:month}
                        ]
                    }
                }
            ]
        );
        let data_phat_detail = await Tinhluong365ThuongPhat.aggregate(
            [
                {
                    $match:{
                        $and:[
                            {pay_id_com:id_com},
                            {pay_status:2},
                            {pay_year:year},
                            {pay_month:month}
                        ]
                    }
                }
            ]
        );

        return res.status(200).json({ data: {
            data_thuong,
            data_phat,
            data_phat_detail,
            data_thuong_detail,
            listUser
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// show thưởng phạt của nhân viên 
exports.take_thuong_phat_em = async (req, res) => {
    try{
        const ep_id = Number(req.body.ep_id);
        const month = Number(req.body.month);
        const year = Number(req.body.year);
        let data_thuong_phat = await Tinhluong365ThuongPhat.find({
            pay_id_user:ep_id,
            pay_year:year,
            pay_month:month
        }).lean();
        return res.status(200).json({ data: {
            data_thuong_phat
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// chỉnh sửa thưởng phạt 
exports.edit_thuong_phat= async (req, res) => {
    try{
        const pay_price = Number(req.body.pay_price);
        const pay_status = Number(req.body.pay_status);
        const pay_case = String(req.body.pay_case);
        const pay_day = new Date(req.body.pay_day);
        const pay_month = String(req.body.pay_month);
        const pay_year = Number(req.body.pay_year);
        const pay_id = Number(req.body.pay_id);
        await Tinhluong365ThuongPhat.updateOne({
            pay_id
        },{
            $set:{
                pay_price,
                pay_status,
                pay_case,
                pay_day,
                pay_month,
                pay_year
            }
        })
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.delete_thuong_phat= async (req, res) => {
    try{
        const pay_id = Number(req.body.pay_id);
        await Tinhluong365ThuongPhat.deleteOne({
            pay_id
        })
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// thêm thưởng phạt 
exports.insert_thuong_phat= async (req, res) => {
    try{
        const pay_id_user = Number(req.body.pay_id_user);
        const pay_id_com = Number(req.body.pay_id_com);
        const pay_price = Number(req.body.pay_price);
        const pay_status = Number(req.body.pay_status);
        const pay_case = String(req.body.pay_case);
        const pay_day = new Date(req.body.pay_day);
        const pay_month = Number(req.body.pay_month);
        const pay_year = Number(req.body.pay_year);
        let data_counter = await Counter.findOne({TableId:'Tinhluong365ThuongPhatId'}).lean();
        let pay_id = data_counter.Count + 1;
        let newobj = new Tinhluong365ThuongPhat({
            pay_id,
            pay_id_user,
            pay_id_com,
            pay_price,
            pay_status,
            pay_case,
            pay_day,
            pay_month,
            pay_year
        });
        let newobj1 = await newobj.save();
        return res.status(200).json({ data: {
            newobj1
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// phúc lợi
// thêm danh mục phúc lợi  
exports.insert_phuc_loi= async (req, res) => {
    try{
        const cl_name = String(req.body.cl_name);
        const cl_salary = Number(req.body.cl_salary);
        const cl_day = new Date(req.body.cl_day)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cl_day_end = new Date(req.body.cl_day_end)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cl_active = new Date(req.body.cl_active)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cl_note = String(req.body.cl_note)||"";
        const cl_type = Number(req.body.cl_type)||0;
        const cl_type_tax = Number(req.body.cl_type_tax)||0;
        const cl_com = Number(req.body.cl_com)||0;
        let data_counter = await Counter.findOne({TableId:'TinhluongListClassId'}).lean();
        let cl_id = data_counter.Count + 1;
        let obj = new TinhluongListClass({
            cl_id,
            cl_name,
            cl_salary,
            cl_day,
            cl_day_end,
            cl_active,
            cl_note,
            cl_type,
            cl_type_tax,
            cl_com
        })
        let newobj = await obj.save();
       
        return res.status(200).json({ data: true, message: "success" , newobj});
    }catch (error) {
        console.error("insert_phuc_loi", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// xóa phúc lợi 
exports.delete_phuc_loi= async (req, res) => {
    try{
        const cl_id = Number(req.body.cl_id);
        await TinhluongListClass.deleteOne({cl_id});
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("insert_phuc_loi", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy danh mục phúc lợi của công ty 
exports.take_phuc_loi= async (req, res) => {
    try{
        const cp = Number(req.body.companyId);
        // phúc lợi
        let list_welf = await TinhluongListClass.find(
            {
                cl_com:cp,
                cl_type:3
            },
            {
                cl_id:1,
                cl_name:1,
                cl_salary:1,
                cl_day:1,
                cl_day_end:1,
                cl_active:1,
                cl_note:1,
                cl_type:1,
                cl_type_tax:1,
                cl_com:1,
                cl_time_created:1
            }
        ).sort({cl_id:-1}).lean();
        // phụ cấp 
        let list_welfa = await TinhluongListClass.find(
            {
                cl_com:cp,
                cl_type:4
            },
            {
                cl_id:1,
                cl_name:1,
                cl_salary:1,
                cl_day:1,
                cl_day_end:1,
                cl_active:1,
                cl_note:1,
                cl_type:1,
                cl_type_tax:1,
                cl_com:1,
                cl_time_created:1
            }
        ).sort({cl_id:-1}).lean();

        // phụ cấp theo ca 
        let wf_shift = await TinhluongWelfareShift.find({
            wf_com:cp
        }).sort({wf_id:-1}).lean();
        
        let list_group = await TinhluongListGroup.find({lgr_id_com:cp})
        
        return res.status(200).json({ data: {
            list_welf,
            list_welfa,
            wf_shift,
            list_group
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// chỉnh sửa phụ cấp 
exports.edit_phuc_loi= async (req, res) => {
    try{
        const cls_day = new Date(req.body.cls_day)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cls_day_end = new Date(req.body.cls_day_end)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cls_id = Number(req.body.cls_id);
        if(cls_id){
            await TinhluongClass.updateOne(
                {
                    cls_id
                },
                {
                    $set:{
                        cls_day,
                        cls_day_end
                    }
                }
            );
            return res.status(200).json({ data: true, message: "success" });
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// thêm phụ cấp theo ca 
exports.insert_wf_shift= async (req, res) => {
    try{
        let wf_com = Number(req.body.wf_com);
        let wf_money = Number(req.body.wf_money)||0;
        let wf_time = new Date(req.body.wf_time);
        let wf_time_end = new Date(req.body.wf_time);
        let wf_shift = Number(req.body.wf_shift)||0;
        let data_counter = await Counter.findOne({TableId:'TinhluongWelfareShiftId'});
        if(data_counter){
            let wf_id = data_counter.Count + 1;
            let obj = new TinhluongWelfareShift(
                { 
                    wf_id,
                    wf_com,
                    wf_money,
                    wf_time,
                    wf_time_end,
                    wf_shift
                }
            )
            let newobj = await obj.save();
            return res.status(200).json({ data:true, message: "success", newobj });
        };
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
// chỉnh sửa phụ cấp theo ca 
exports.edit_wf_shift= async (req, res) => {
    try{
        let wf_money = Number(req.body.wf_money)||0;
        let wf_time = new Date(req.body.wf_time);
        let wf_time_end = new Date(req.body.wf_time);
        let wf_id = Number(req.body.wf_id);
        await TinhluongWelfareShift.updateOne({wf_id},{$set:{
            wf_money,
            wf_time,
            wf_time_end
        }})
        return res.status(200).json({ data:true, message: "success",
           newobj:await TinhluongWelfareShift.findOne({wf_id}).lean()
        });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// xóa phụ cấp theo ca 
exports.delete_wf_shift= async (req, res) => {
    try{
        let wf_id = Number(req.body.wf_id);
        await TinhluongWelfareShift.deleteOne({wf_id});
        return res.status(200).json({ data:true, message: "success",
           newobj:await TinhluongWelfareShift.findOne({wf_id}).lean()
        });
    }catch (error) {
        console.error("controller/tinhluong/congty delete_wf_shift", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// danh mục phúc lợi 
exports.sua_phuc_loi= async (req, res) => {
    try{
        const cl_name = String(req.body.cl_name);
        const cl_salary = Number(req.body.cl_salary);
        const cl_day = new Date(req.body.cl_day)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cl_day_end = new Date(req.body.cl_day_end)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cl_active = new Date(req.body.cl_active)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cl_note = String(req.body.cl_note)||"";
        const cl_type = Number(req.body.cl_type)||0;
        const cl_type_tax = Number(req.body.cl_type_tax)||0;
        const cl_id = Number(req.body.cl_id);
        if(cl_id){
            await TinhluongListClass.updateOne(
                {
                    cl_id:cl_id
                },
                {
                    $set:{
                        cl_name,
                        cl_salary,
                        cl_day,
                        cl_day_end,
                        cl_active,
                        cl_note,
                        cl_type,
                        cl_type_tax
                    }
                }
            );
            return res.status(200).json({ data: true, message: "success" });
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/congty sua_phuc_loi", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// sửa hạn cho từng nhân viên 
exports.sua_nc_phuc_loi_tro_cap= async (req, res) => {
    try{
        const cls_id_com = Number(req.body.cls_id_com);
        const cls_day = new Date(req.body.cls_day)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cls_day_end = new Date(req.body.cls_day_end)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cls_id = Number(req.body.cls_id);
        if(cls_id){
            await TinhluongClass.updateOne(
                {
                    cls_id,
                    cls_id_com
                },
                {
                    $set:{
                        cls_day,
                        cls_day_end
                    }
                }
            );
            return res.status(200).json({ data: true, message: "success" });
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// phúc lợi nhóm => Không thấy trong thiết kế 
// TinhluongGroup lưu trữ thông tin nhân viên của các nhóm 
// TinhluongListGroup: Thông tin các nhóm làm việc 
// TinhluongClass: Thông tin của các nhân viên trong các nhóm 
// phúc lợi nhóm sẽ được link bởi: cls_id_group
exports.insert_phuc_loi_nhom = async (req, res) => {
    try{
        const cls_id_group = Number(req.body.cls_id_group);
        const cls_id_com = Number(req.body.cls_id_com);
        const cls_id_cl = Number(req.body.cls_id_cl);
        let show_stafgr = await TinhluongGroup.find({
            gm_id_group:cls_id_group
        },{gm_id_group:1, gm_id_user:1}).sort({_id:-1}).limit(1).lean()
        if(show_stafgr && show_stafgr.length){
            show_stafgr = show_stafgr[0];
            let data_counter = await Counter.findOne({TableId:'TinhluongClassSchemaId'});
            if(data_counter){
                let cls_id = data_counter.Count + 1;
                let obj = new TinhluongClass(
                    { 
                      cls_id,
                      cls_id_cl,
                      cls_id_user:show_stafgr.gm_id_user,
                      cls_id_group,
                      cls_id_com
                    }
                )
                await obj.save();
            }
            return res.status(200).json({ data: true, message: "success" });
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// thêm thành viên vào danh mục phúc lợi
exports.them_nv_nhom = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        const cls_id_com = Number(req.body.cls_id_com);
        const cls_id_user = Number(req.body.cls_id_user);
        const cls_day = new Date(req.body.cls_day);
        const cls_day_end = new Date(req.body.cls_day_end);
        let dataListClass = await TinhluongListClass.findOne({cl_id:cls_id_cl});
        if(dataListClass && (dataListClass.cl_com == cls_id_com)){
            let data_counter = await Counter.findOne({TableId:'TinhluongClassId'});
            if(data_counter){
                let cls_id = data_counter.Count + 1;
                await TinhluongClass.deleteMany({cls_id_cl,cls_id_user,cls_id_com});
                let obj = new TinhluongClass(
                    { 
                      cls_id,
                      cls_id_cl,
                      cls_id_user,
                      cls_day,
                      cls_id_com,
                      cls_day_end
                    }
                )
                let newobj = await obj.save();
                return res.status(200).json({ data: true, message: "success",newobj });
            }
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy danh sách thành viên thuộc danh mục phúc lợi 
exports.take_list_nv_nhom = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        let listUser = await TinhluongClass.find({
            cls_id_cl
        },{cls_id_user:1}).lean();
        let detail = await TinhluongListClass.findOne({cl_id:cls_id_cl}).lean();
        let array = [];
        for(let i = 0; i < listUser.length; i++){
            array.push(Number(listUser[i].cls_id_user));
        }
        let listUserFinal = await User.find({idQLC:{$in:array}},{password:0}).lean()
        return res.status(200).json({ data: true, message: "success",listUserFinal,detail });
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy danh sách nhân viên dược hưởng phúc lợi 
exports.show_list_user_phuc_loi_com = async (req, res) => {
    try{
        const cls_id_com = Number(req.body.cls_id_com);
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        // lấy về 1 lượt => lưu dưới client rồi phân loại 
        let list_us = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {
                            $or:[
                                {cls_day_end:{$gte:start_date}},
                                {cls_day_end:new Date('1970-01-01T00:00:00.000+00:00')}
                            ]
                        },
                        {cls_day:{$lte:end_date}},
                        {cls_id_com:cls_id_com}
                    ]
                }
            },
            {
                $lookup:{
                    from: 'TinhluongListClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass'
                }
            },
            {
                $project:{
                    "cls_id_user":1,
                    "TinhluongListClass.cl_name":1,
                    "cls_id_cl":1,
                    "cls_day":1,
                    "TinhluongListClass.cl_id_form":1,
                    "TinhluongListClass.cl_type":1,
                    "TinhluongListClass.cl_active":1,
                    "cls_id":1,
                    "cls_day_end":1,
                }
            },
            {
                $match:{
                    "TinhluongListClass.cl_type":{$in:[3,4]},
                    "TinhluongListClass.cl_active":1
                }
            },
            {
                $lookup:{
                    from: 'TinhluongFormSalary', 
                    localField: 'TinhluongListClass.cl_id_form', 
                    foreignField: 'fs_id', 
                    as: 'TinhluongFormSalary'
                }
            },
            {
                $lookup:{
                    from: 'Users', 
                    localField: 'cls_id_user', 
                    foreignField: 'idQLC', 
                    as: 'Detail'
                }
            },
        ]);
        
        return res.status(200).json({ data: true, message: "success",list_us});
    }catch (error) {
        console.error("controller/tinhluong/congty update_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
// Xóa nhân viên khỏi danh sách phúc lợi 
exports.delete_nv_nhom = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        const cls_id_user = Number(req.body.cls_id_user);
        await TinhluongClass.deleteOne({
            cls_id_cl,
            cls_id_user
        })
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.them_thiet_lap = async (req, res) => {
    try{
        const tl_id_com = Number(req.body.tl_id_com);
        const tl_id_rose = Number(req.body.tl_id_rose);
        const tl_name = String(req.body.tl_name);
        const tl_money_min = Number(req.body.tl_money_min);
        const tl_money_max = Number(req.body.tl_money_max);
        const tl_phan_tram = Number(req.body.tl_phan_tram)
        const tl_chiphi = Number(req.body.tl_chiphi);
        const tl_hoahong = Number(req.body.tl_hoahong);
        const tl_kpi_yes = Number(req.body.tl_kpi_yes);
        const tl_kpi_no = Number(req.body.tl_kpi_no);
        let data_counter = await Counter.findOne({TableId:'TinhluongThietLapId'});
        if(data_counter){
            let tl_id = data_counter.Count + 1;
            let obj = new TinhluongThietLap(
                { 
                    tl_id,
                    tl_id_com,
                    tl_id_rose,
                    tl_name,
                    tl_money_min,
                    tl_money_max,
                    tl_phan_tram,
                    tl_chiphi,
                    tl_hoahong,
                    tl_kpi_yes,
                    tl_kpi_no
                }
            )
            await obj.save();
        }
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.capnhat_thiet_lap_minmaxphantram = async (req, res) => {
    try{
        const tl_name = String(req.body.tl_name);
        const tl_money_min = Number(req.body.tl_money_min);
        const tl_money_max = Number(req.body.tl_money_max);
        const tl_phan_tram = Number(req.body.tl_phan_tram);
        const tl_id = Number(req.body.tl_id);
        await TinhluongThietLap.updateOne({
            tl_id: tl_id,
        },{
            $set:{
                tl_name,
                tl_money_min,
                tl_money_max,
                tl_phan_tram
            }
        })
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.capnhat_thiet_lap_chiphi = async (req, res) => {
    try{
        const tl_name = String(req.body.tl_name);
        const tl_chiphi = Number(req.body.tl_chiphi);
        const tl_id = Number(req.body.tl_id);
        await TinhluongThietLap.updateOne({
            tl_id: tl_id,
        },{
            $set:{
                tl_name,
                tl_chiphi
            }
        })
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.capnhat_thiet_lap_hoahong = async (req, res) => {
    try{
        const tl_name = String(req.body.tl_name);
        const tl_hoahong = Number(req.body.tl_hoahong);
        const tl_id = Number(req.body.tl_id);
        await TinhluongThietLap.updateOne({
            tl_id: tl_id,
        },{
            $set:{
                tl_name,
                tl_hoahong
            }
        })
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.capnhat_thiet_lap_kpi = async (req, res) => {
    try{
        const tl_name = String(req.body.tl_name);
        const tl_kpi_no = Number(req.body.tl_kpi_no);
        const tl_kpi_yes = Number(req.body.tl_kpi_yes);
        const tl_id = Number(req.body.tl_id);
        await TinhluongThietLap.updateOne({
            tl_id: tl_id,
        },{
            $set:{
                tl_name,
                tl_kpi_yes,
                tl_kpi_no
            }
        })
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.take_thiet_lap_com = async (req, res) => {
    try{
        const tl_id_com = Number(req.body.tl_id_com);
        let listThietLap = await TinhluongThietLap.find({
            tl_id_com
        }).lean();
        return res.status(200).json({ data: true, message: "success" ,listThietLap});
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// hoa hồng 
// TinhluongListRose : lưu trữ danh sách hoa hồng 
// TinhluongRose : lưu trữ dữ liệu hoa hồng của các nhân viên 
// TinhluongThietLap: thiết lâp cho từng loại hoa hồng ở từng công ty một 
// thêm hoa dồng cho 1 nhân viên 
exports.insert_rose = async (req, res) => {
    try{
        const ro_id_user = Number(req.body.ro_id_user);
        const ro_id_com = Number(req.body.ro_id_com);
        const ro_id_lr = Number(req.body.ro_id_lr);
        const ro_time = new Date(req.body.ro_time);
        const ro_note = String(req.body.ro_note);
        const ro_price = Number(req.body.ro_price);
        await TinhluongRose.deleteOne({
            ro_id_user,
            ro_id_com,
            ro_id_lr
        })
        let data_counter = await Counter.findOne({TableId:'TinhluongRoseId'}).lean();
        let ro_id = data_counter.Count + 1;
        let obj = new TinhluongRose({
            ro_id,
            ro_id_user,
            ro_id_com,
            ro_id_lr,
            ro_time,
            ro_note,
            ro_price
        })
        let newobj = await obj.save();
        return res.status(200).json({ data: true, message: "success" ,newobj});
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy dữ liệu hoa hồng 
exports.take_all_data_rose = async (req, res) => {
    try{
        const tl_id_com = Number(req.body.tl_id_com);
        let list_ln = [];
        let list_vt = [];
        let list_kh = [];
        let list_data = await TinhluongThietLap.find({
            tl_id_rose:{$in:[3,4,5]},
            tl_id_com:tl_id_com
        }).lean();
        for(let i = 0; i <list_data.length; i++){
            if(list_data[i].tl_id_rose == 3){
                list_ln.push(list_data[i]);
            }
            if(list_data[i].tl_id_rose == 4){
                list_vt.push(list_data[i])
            }
            if(list_data[i].tl_id_rose == 5){
                list_kh.push(list_data[i])
            }
        };
        let list_cate_rose = await TinhluongListRose.find({}).lean();
        let list_rose = await TinhluongRose.find({ro_id_com:tl_id_com}).lean();
        return res.status(200).json({ 
            data: true, message: "success" ,
            list_ln,
            list_vt,
            list_kh,
            list_rose,
            list_cate_rose
        });
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy tiền hoa hồng của công ty/người trong 1 khoảng thời gian 
exports.lay_tien_ca_nhan = async (req, res) => {
    try{
        // ro_time: thời hạn hoa hồng 
        // lấy trong vòng 1 tháng 
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        const ro_id_com = Number(req.body.ro_id_com);
        let ro_id_user = 0;
        if(req.body.ro_id_user){
            ro_id_user = Number(req.body.ro_id_user);
        };
        let condition = {
            $and:[
                {ro_id_com:ro_id_com},
                {ro_time:{$gte:start_date}},
                {ro_time:{$lte:end_date}},
                {ro_id_group:0}
            ]
        }
        if(ro_id_user){
            condition = {
                $and:[
                    {ro_id_user:ro_id_user},
                    {ro_id_com:ro_id_com},
                    {ro_time:{$gte:start_date}},
                    {ro_time:{$lte:end_date}},
                    {ro_id_group:0}
                ]
            }
        }
        let rose_user = await TinhluongRose.aggregate([
            {
               $match:condition
            },
            {
                $lookup: { 
                    from: 'TinhluongThietLap', 
                    localField: 'ro_id_tl', 
                    foreignField: 'tl_id', 
                    as: 'TinhluongThietLap' 
                } 
            },
            {
                $lookup: { 
                    from: 'Users', 
                    localField: 'ro_id_user', 
                    foreignField: 'idQLC', 
                    as: 'detail' 
                } 
            },
            {
                $project:{
                    "detail.password":0
                }
            }
        ])
        return res.status(200).json({ 
            data: true, message: "success" ,
            rose_user
        });
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


exports.lay_tien_ca_nhan_theo_nhom = async (req, res) => {
    try{
        // ro_time: thời hạn hoa hồng 
        // lấy trong vòng 1 tháng 
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        const ro_id_com = Number(req.body.ro_id_com);
        let ro_id_user = 0;
        if(req.body.ro_id_user){
            ro_id_user = Number(req.body.ro_id_user);
        };
        let condition = {
            $and:[
                {ro_id_com:ro_id_com},
                {ro_time:{$gte:start_date}},
                {ro_time:{$lte:end_date}}
            ]
        }
        if(ro_id_user){
            condition = {
                $and:[
                    {ro_id_user:ro_id_user},
                    {ro_id_com:ro_id_com},
                    {ro_time:{$gte:start_date}},
                    {ro_time:{$lte:end_date}}
                ]
            }
        }
        let rose_user = await TinhluongRose.aggregate([
            {
               $match:condition
            },
            {
                $lookup: { 
                    from: 'TinhluongThietLap', 
                    localField: 'ro_id_tl', 
                    foreignField: 'tl_id', 
                    as: 'TinhluongThietLap' 
                } 
            }
        ])
        return res.status(200).json({ 
            data: true, message: "success" ,
            rose_user
        });
    }catch (error) {
        console.error("controller/tinhluong/conty lay_tien_ca_nhan_theo_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// các loại tiền khác 
// công thức lưu ở fs_repica 
// fs_id => cl_id_form(ListClass) => cl_id(ListClass) => cls_id_cl (class) => cls_id_user(class)=> idQLC
exports.insert_other_money = async (req, res) => {
    try{
        const fs_id_com = Number(req.body.fs_id_com);
        const fs_type = Number(req.body.fs_type);
        const fs_name = String(req.body.fs_name);
        const fs_data = String(req.body.fs_data);
        const fs_repica = String(req.body.fs_repica);
        const cl_name = String(req.body.cl_name);
        const cl_active = Number(req.body.cl_active);
        const cl_note = String(req.body.cl_note);
        const cl_type = Number(req.body.cl_type);

        let counter_data1 = await Counter.findOne({TableId: 'TinhluongFormSalaryId'}).lean();
        let fs_id = counter_data1.Count +1;
        let obj1 = new TinhluongFormSalary({
            fs_id,
            fs_type,
            fs_name,
            fs_data,
            fs_repica
        });
        let form_new = await obj1.save();
        const cl_id_form = fs_id;
        const cl_com = fs_id_com;
        let counter_data2 = await Counter.findOne({TableId: 'TinhluongListClassId'}).lean();
        let cl_id = counter_data2.Count + 1;
        let obj2 = new TinhluongListClass({
            cl_id,
            cl_name,
            cl_active,
            cl_note,
            cl_type,
            cl_id_form,
            cl_com
        })
        let class_new = await obj2.save();
        return res.status(200).json({ 
            data: {
                class_new,
                form_new
            }, 
            message: "success",
        });
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// show cac loai tien khac
// lấy danh sách các loại tiền khác ( màn trang chủ )
exports.show_other_money = async (req, res) => {
    try{
        const cl_com = Number(req.body.cl_com);
        let listdata = await TinhluongListClass.aggregate([
            {
                $match:{
                    cl_com: cl_com,
                    cl_type:5
                }
            },
            {
                $lookup: { 
                    from: 'TinhluongFormSalary', 
                    localField: 'cl_id_form', 
                    foreignField: 'fs_id', 
                    as: 'TinhluongFormSalary' 
                } 
            }
        ])
        return res.status(200).json({ data: true, message: "success",listdata});
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy danh sách nhân viên được set 
exports.show_listuser_setted_other_money = async (req, res) => {
    try{
        const cp = Number(req.body.cp);
        let listdata = await TinhluongClass.aggregate([
            {
                $match:{
                    cls_id_com:cp
                }
            },
            {
                $lookup: { 
                    from: 'TinhluongListClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass' 
                } 
            },
            {
                $match:{
                    'TinhluongListClass.0': {$exists: true}
                }
            },
            {
                $lookup: { 
                    from: 'TinhluongFormSalary', 
                    localField: 'TinhluongListClass.cl_id_form', 
                    foreignField: 'fs_id', 
                    as: 'TinhluongFormSalary' 
                } 
            }, // mảng cùng cấp 
            {
                $match:{
                    'TinhluongFormSalary.0': {$exists: true}
                }
            },
            {
                $lookup: { 
                    from: 'Users', 
                    localField: 'cls_id_user', 
                    foreignField: 'idQLC', 
                    as: 'detail' 
                } 
            }, // mảng cùng cấp 
        ])
        return res.status(200).json({ data: true, message: "success",listdata});
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// sua loai tien khac
exports.edit_other_money = async (req, res) => {
    try{
        const cl_name = String(req.body.cl_name);
        const cl_note = String(req.body.cl_note);
        const cl_id = Number(req.body.cl_id);
        const fs_name = String(req.body.fs_name);
        const fs_data = Number(req.body.fs_data);
        const fs_id = Number(req.body.fs_id);
        await TinhluongListClass.updateOne(
            {
                cl_id
            },
            {
                $set:{
                    cl_name,
                    cl_note
                }
            }
        );
        await TinhluongFormSalary.updateOne(
            {
                fs_id
            },
            {
                fs_name,
                fs_data
            }
        );
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// thêm thành viên vào nhóm tiền khác 
exports.them_nv_nhom_other_money = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        const cls_id_com = Number(req.body.cls_id_com);
        const cls_id_user = Number(req.body.cls_id_user);
        const cls_day = new Date(req.body.cls_day);
        const cls_day_end = new Date(req.body.cls_day_end);
        let dataListClass = await TinhluongListClass.findOne({cl_id:cls_id_cl});
        if(dataListClass && (dataListClass.cl_com == cls_id_com)){
            let data_counter = await Counter.findOne({TableId:'TinhluongClassId'});
            if(data_counter){
                let cls_id = data_counter.Count + 1;
                await TinhluongClass.deleteMany({cls_id_cl,cls_id_user,cls_id_com});
                let obj = new TinhluongClass(
                    { 
                      cls_id,
                      cls_id_cl,
                      cls_id_user,
                      cls_day,
                      cls_id_com,
                      cls_day_end
                    }
                )
                let newobj = await obj.save();
                return res.status(200).json({ data: true, message: "success",newobj });
            }
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy danh sách thành viên  
exports.take_list_nv_nhom_other_money = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        let listUser = await TinhluongClass.find({
            cls_id_cl
        },{cls_id_user:1}).lean();

        let array = [];
        for(let i = 0; i < listUser.length; i++){
            array.push(Number(listUser[i].cls_id_user));
        }
        let listUserFinal = await User.find({idQLC:{$in:array}},{password:0}).lean();
        return res.status(200).json({ data: true, message: "success",listUserFinal });
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


exports.delete_other_money = async (req, res) => {
    try{
        const cl_id = Number(req.body.cl_id);
        await TinhluongListClass.deleteOne({cl_id})
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// Xóa nhân viên khỏi nhóm tiền khác 
exports.delete_nv_nhom_other_money = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        const cls_id_user = Number(req.body.cls_id_user);
        await TinhluongClass.deleteOne({
            cls_id_cl,
            cls_id_user
        })
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy thông tin bổ sung của các loại tiền khác 
exports.takeinfo_other_money_additional = async (req, res) => {
    try{
        const com_id = Number(req.body.cl_com);
        let tb_class = await TinhluongClass.find({cls_id_com:com_id}).lean();
        let group_one = await TinhluongListGroup.find({lgr_id_com:com_id}).lean();
        return res.status(200).json({ data: true, message: "success",tb_class,group_one});
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

//bảo hiểm page 
// bảo hiểm thì cls_id_cl = 3;
// thêm bảo hiểm cho 1 nhân viên của 1 công ty 
exports.insert_insrc = async (req, res) => {
    try{
        const cls_id_cl = 3;
        const cls_id_user = Number(req.body.cls_id_user);
        const cls_id_com = Number(req.body.cls_id_com);
        const cls_day = new Date(req.body.cls_day);
        const cls_salary = Number(req.body.cls_salary);
        const cls_lydo = String(req.body.cls_lydo);
        const cls_quyetdinh = String(req.body.cls_quyetdinh);
        const cls_phu_cap_bh = Number(req.body.cls_phu_cap_bh)||0;
        let data_counter = await Counter.findOne({TableId:'TinhluongClassId'});
        if(data_counter){
            let cls_id = data_counter.Count + 1;
            let obj = new TinhluongClass(
                { 
                  cls_id,
                  cls_id_cl,
                  cls_id_user,
                  cls_day,
                  cls_id_com,
                  cls_salary,
                  cls_lydo,
                  cls_quyetdinh,
                  cls_phu_cap_bh
                }
            )
            let newobj = await obj.save();
            return res.status(200).json({ data: true, message: "success" ,newobj});
        }
    }catch (error) {
        console.error("controller/tinhluong/congty insert_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// ajax/ins_add.php
// thêm công thức tính bảo hiểm 
exports.insert_category_insrc = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        const fs_type = 2; // loai bao hiem 
        const fs_id_com = com_id;
        const fs_name = String(req.body.fs_name);  // tên loại bảo hiểm 
        const fs_data = Number(req.body.fs_data);  // loại công thức , mặc định là 1 
        const fs_repica = String(req.body.fs_repica);  // công thức tính bảo hiểm 
        const fs_note = String(req.body.fs_note); // ghi chú 
        
        const cl_name = String(req.body.cl_name); // tên bảo hiểm mà công ty đó đặt cho từng tháng 
        const cl_note = String(req.body.cl_note); // ghi chú 
        const cl_type = 2;
        const cl_com = com_id;

        let data_counter = await Counter.findOne({TableId:'TinhluongFormSalaryId'}).lean();
        let fs_id = data_counter.Count + 1;
        let form_salary = new TinhluongFormSalary(
            { 
                fs_id,
                fs_type,
                fs_id_com,
                fs_name,
                fs_data,
                fs_repica,
                fs_note
            }
        );
        let new_form_salary = await form_salary.save();
        const cl_id_form = new_form_salary.fs_id;
        
        data_counter = await Counter.findOne({TableId:'TinhluongListClassId'}).lean();
        let cl_id = data_counter.Count + 1;
         
        let list_class = new TinhluongListClass({
            cl_id,
            cl_name,
            cl_note,
            cl_type,
            cl_com,
            cl_id_form
        });

        let new_list_class = await list_class.save();

        return res.status(200).json({ data:{
            thong_tin_bao_hiem:new_form_salary,
            bao_hiem_cong_ty:list_class
        }, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty insert_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// thông tin để hiển thị công thức tính 
// có 2 cái được fix cứng là 10,5%
// fs_rep == BHXH thì là BHXH theo lương cơ bản 
// fs_rep == " " BHXH theo lương nhập vào 
exports.takeinfo_insrc = async (req, res) => {
    try{
        const com_id = Number(req.body.cl_com);
        let tax_list = await TinhluongListClass.aggregate([
            {
                $match:{
                    $and:[
                        {cl_type:2},
                        {cl_com:com_id}
                    ]
                }
            },
            {
                $lookup:{
                    from: 'TinhluongFormSalary', 
                    localField: 'cl_id_form', 
                    foreignField: 'fs_id', 
                    as: 'TinhluongFormSalary'
                }
            }
        ]);
        let group_one = await TinhluongListGroup.find({lgr_id_com:com_id}).lean();
        return res.status(200).json({ data: true, message: "success",tax_list,group_one});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// thêm thành viên vào nhóm tiền khác 
exports.them_nv_nhom_insrc = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        const cls_id_com = Number(req.body.cls_id_com);
        const cls_id_user = Number(req.body.cls_id_user);
        const cls_day = new Date(req.body.cls_day);
        const cls_day_end = new Date(req.body.cls_day_end);
        let dataListClass = await TinhluongListClass.findOne({cl_id:cls_id_cl});
        if(dataListClass && (dataListClass.cl_com == cls_id_com)){
            let data_counter = await Counter.findOne({TableId:'TinhluongClassId'});
            if(data_counter){
                let cls_id = data_counter.Count + 1;
                await TinhluongClass.deleteMany({cls_id_cl,cls_id_user,cls_id_com});
                let obj = new TinhluongClass(
                    { 
                      cls_id,
                      cls_id_cl,
                      cls_id_user,
                      cls_day,
                      cls_id_com,
                      cls_day_end
                    }
                )
                let newobj = await obj.save();
                return res.status(200).json({ data: true, message: "success",newobj });
            }
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy danh sách thành viên bảo hiểm 
exports.take_list_nv_insrc = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        let listUser = await TinhluongClass.find({
            cls_id_cl
        },{cls_id_user:1}).lean();

        let array = [];
        for(let i = 0; i < listUser.length; i++){
            array.push(Number(listUser[i].cls_id_user));
        }
        let listUserFinal = await User.find({idQLC:{$in:array}},{password:0}).lean()
        return res.status(200).json({ data: true, message: "success",listUserFinal });
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.delete_nv_insrc = async (req, res) => {
    try{
        const cl_id = Number(req.body.cl_id);
        await TinhluongListClass.deleteOne({cl_id})
        return res.status(200).json({ data: true, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.update_insrc = async (req, res) => {
    try{
        const cl_name = String(req.body.cl_name);
        const cl_note = String(req.body.cl_note);
        const cl_id = Number(req.body.cl_id);
        const fs_name = String(req.body.fs_name);
        const fs_data = String(req.body.fs_data);
        const fs_id = Number(req.body.fs_id);
        await TinhluongListClass.updateOne(
            {
                cl_id
            },
            {
                $set:{
                    cl_name,
                    cl_note
                }
            }
        );
        await TinhluongFormSalary.updateOne(
            {
                fs_id
            },
            {
                fs_name,
                fs_data
            }
        );
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty update_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// danh sách đăng ký bảo hiểm trong công ty 
exports.show_list_user_insrc = async (req, res) => {
    try{
        const cls_id_com = Number(req.body.cls_id_com);
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        // take all 
        let list_us = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {
                            $or:[
                                {cls_day_end:{$gte:start_date}},
                                {cls_day_end:new Date('1970-01-01T00:00:00.000+00:00')}
                            ]
                        },
                        {cls_day:{$lte:end_date}},
                        {cls_id_com:cls_id_com}
                    ]
                }
            },
            {
                $lookup:{
                    from: 'TinhluongListClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass'
                }
            },
            {
                $project:{
                    "cls_id_user":1,
                    "TinhluongListClass.cl_name":1,
                    "cls_id_cl":1,
                    "cls_day":1,
                    "TinhluongListClass.cl_id_form":1,
                    "TinhluongListClass.cl_type":1,
                    "TinhluongListClass.cl_active":1,
                    "cls_id":1,
                    "cls_day_end":1,
                }
            },
            {
                $match:{
                    "TinhluongListClass.cl_type":2,
                    "TinhluongListClass.cl_active":1
                }
            },
            {
                $lookup:{
                    from: 'TinhluongFormSalary', 
                    localField: 'TinhluongListClass.cl_id_form', 
                    foreignField: 'fs_id', 
                    as: 'TinhluongFormSalary'
                }
            },
            {
                $lookup:{
                    from: 'Users', 
                    localField: 'cls_id_user', 
                    foreignField: 'idQLC', 
                    as: 'Detail'
                }
            },
        ]);
        
        return res.status(200).json({ data: true, message: "success",list_us});
    }catch (error) {
        console.error("controller/tinhluong/congty update_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// danh sách không đăng ký bảo hiểm trong công ty 
exports.show_list_user_noinsrc = async (req, res) => {
    try{
        const cls_id_com = Number(req.body.cls_id_com);
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        let listUser = await User.find(
            {"inForPerson.employee.com_id":cls_id_com},
            {idQLC:1}
        ).lean();
        let array = [];
        for(let i = 0; i < listUser.length; i++) {
            array.push(listUser[i].idQLC)
        }
        
        let list_us = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {
                            $or:[
                                {cls_day_end:{$gte:start_date}},
                                {cls_day_end:new Date('1970-01-01T00:00:00.000+00:00')}
                            ]
                        },
                        {cls_day:{$lte:end_date}},
                        {cls_day:{$gte:end_date}},
                        {cls_id_com:cls_id_com}
                    ]
                }
            },
            {
                $lookup:{
                    from: 'TinhluongListClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass'
                }
            },
            {
                $project:{
                    "cls_id_user":1,
                    "TinhluongListClass.cl_name":1,
                    "cls_id_cl":1,
                    "cls_day":1,
                    "TinhluongListClass.cl_id_form":1,
                    "TinhluongListClass.cl_type":1,
                    "TinhluongListClass.cl_active":1,
                    "cls_id":1,
                    "cls_day_end":1,
                }
            },
            {
                $match:{
                    "TinhluongListClass.cl_type":2,
                    "TinhluongListClass.cl_active":1
                }
            },
            {
                $project:{
                    "cls_id_user":1,
                }
            },
        ]);

        array = array.filter((a)=> !list_us.find((e)=> e.cls_id_user == a ));
        let listUserFinal = await User.find({
            idQLC:{$in:array}
        });
        return res.status(200).json({ data: true, message: "success",listUserFinal});
    }catch (error) {
        console.error("controller/tinhluong/congty update_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}



// quan-ly-bang-luong-nhan-vien
exports.show_bangluong_nv = async (req, res) => {
    try{
        let com_id = Number(req.body.com_id);
        // console.log(com_id);
        const cp = com_id;
        const dep_id = Number(req.body.dep_id) || 0;
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date);
        const month = Number(req.body.month);
        const year = Number(req.body.year);
        const limit = 10;
        const skip = Number(req.body.skip);
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));
        let listResult = [];
        let condition = {"inForPerson.employee.com_id":com_id,type:2};
        if(dep_id){
            condition = {"inForPerson.employee.com_id":com_id, "inForPerson.employee.dep_id":dep_id,type:2 }
        }
        let listUser = await User.find(
            condition
        ).sort({_id:-1}).lean();
        let array = [];
        for(let i = 0; i < listUser.length; i++) {
            array.push(listUser[i].idQLC)
        };
        
        // take data for caculate 
        let list_data_salary_total = await Tinhluong365SalaryBasic.find(
            {
                sb_id_user:{$in:array},
                sb_time_up:{$lte:end_date}
            },
            {
                sb_salary_basic:1,
                sb_salary_bh:1,
                sb_id_user:1,
                sb_time_up:1
            }
        ).sort({sb_time_up:-1}).lean();

        let list_data_contract = await Tinhluong365Contract.find(
            {
                con_id_user:{$in:array},
                con_time_up:{$lte:end_date},
                $or:[
                    {con_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
                    {con_time_end:{$gte:start_date}}
                ]
            },
            {
                con_salary_persent:1,
                con_id_user:1,
                con_time_up:1,
                con_time_end:1
            }
        ).sort({con_time_up:-1}).lean();
        
        let list_donate_data = await TinhluongDonate.find(
            {
                don_id_user:{$in:array},
                don_time_end:{$lte:end_date},
                don_time_active:{$lte:start_date}
            },
            {don_price:1,don_id_user:1}
        ).lean();

        let list_thuong_phat_data = await Tinhluong365ThuongPhat.find(
            {
                pay_id_user:{$in:array},
                pay_month:month,
                pay_year:year,
                pay_day:{$gte:start_date},
            },
            {
                pay_id:1,
                pay_price:1,
                pay_case:1,
                pay_status:1,
                pay_id_user:1
            }
        ).lean();

        let cong_chuan_congty = await NhanVienService.take_count_standard_works(cp,year,month);
        //cong_chuan_congty = cong_chuan_congty.length;
        
        // lịch làm việc 
        let list_data_circle = await NhanVienService.get_circle_listem(array,cp,new Date(req.body.start_date),new Date(req.body.end_date));
       
        // dữ liệu chấm công 
        let list_data_time_sheet = await CC365_TimeSheet.find(
            {
                ep_id:{$in:array},
                $and:[
                    {
                        at_time:{$gte:start_date}
                    },
                    {
                        at_time:{$lte:end_date}
                    }
                ]
            },
            {
                shift_id:1,
                at_time:1,
                ep_id:1
            }
        ).lean(); 

        // dữ liệu đề xuất 
        let list_de_xuat_duyet_congty = await NhanVienService.get_de_xuat_tl365_congty(array,cp,start_date,end_date);
        
        // lấy phạt đi muộn về sớm ; trả về dạng mảng => dùng filter 
        let list_data_late_early = await NhanVienService.get_list_timekeeping_late_early_by_company(array,cp,start_date,end_date)

        // lấy công thực 
        let list_count_real_works = await NhanVienService.take_count_real_works_com(array,cp,start_date,end_date);
        
        // lấy công ghi nhận thêm 
        let list_get_dx_cong_tl365 = await NhanVienService.get_dx_cong_tl365_com(array,cp,start_date,end_date);

        // lấy phúc lợi 
        let list_data_phuc_loi = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {cls_id_user:{$in:array}},
                        {cls_day:{$lte:end_date}},
                        {cls_id_com:cp}
                    ]
                }
            },
            {   
                $lookup: { 
                    from: 'TinhluongClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass' 
                } 
            },
            {
                $match:{
                    $and:[
                        {"TinhluongListClass.cl_type":3},
                        {"TinhluongListClass.cl_day":{$lte:start_date}},
                        {$or:[
                            {"TinhluongListClass.cl_day_end":new Date('1970-01-01T00:00:00.000+00:00')},
                            {"TinhluongListClass.cl_day_end":{$gte:start_date}}
                        ]}
                    ]
                }
            },
            {
                $project:{
                    "TinhluongListClass.cl_salary":1,
                    "TinhluongListClass.cl_type_tax":1,
                    "cls_id_user":1
                }
            }
        ])

        // lấy phụ cấp 
        let list_data_phu_cap = await TinhluongClass.aggregate([
            {
                $match:{
                    cls_id_user:{$in:array},
                    cls_id_com:cp
                }
            },
            {   
                $lookup: { 
                    from: 'TinhluongClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cls_id_user', 
                    as: 'TinhluongListClass' 
                } 
            },
            {
                $match:{
                    $and:[
                        {"TinhluongListClass.cl_type":4},
                        {"TinhluongListClass.cl_day":{$lte:start_date}},
                        {$or:[
                            {"TinhluongListClass.cl_day_end":new Date('1970-01-01T00:00:00.000+00:00')},
                            {"TinhluongListClass.cl_day_end":{$gte:start_date}}
                        ]}
                    ]
                }
            },
            {
                $project:{
                    "TinhluongListClass.cl_salary":1,
                    "TinhluongListClass.cl_type_tax":1,
                    "TinhluongListClass.cl_day":1,
                    "TinhluongListClass.cl_day_end":1,
                    cls_day:1,
                    cls_day_end:1,
                    cls_id_user:1
                }
            }
        ]);

        // lấy bảo hiểm 
        let list_data_bao_hiem = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {cls_id_user:{$in:array}},
                        {cls_id_com:cp},
                        {cls_day:{$lte:end_date}},
                        {
                            $or:[
                                {cls_day_end:new Date('1970-01-01T00:00:00.000+00:00') },
                                {cls_day_end:{$gte:start_date}}
                            ]
                        }
                    ]
                }
            },
            {   
                $lookup: { 
                    from: 'TinhluongListClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass' 
                } 
            },
            {
                $match:{
                    "TinhluongListClass.cl_type":2
                }
            },
            // {   
            //     $lookup: { 
            //         from: 'TinhluongFormSalary', 
            //         localField: "TinhluongListClass.cl_id_form", 
            //         foreignField: 'fs_id', 
            //         as: 'TinhluongListClass' 
            //     } 
            // },
            {
                $project:{
                    "cls_id_user":1,
                    "cls_id_cl":1,
                    TinhluongListClass:1,
                    cls_day:1,
                    cls_day_end:1
                }
            },
            {
                $sort:{
                    cls_day: -1
                }
            }
        ])

        // lấy hoa hồng cá nhân 
        let list_hoa_hong_ca_nhan = await TinhluongRose.aggregate([
            {
                $match:{
                    $and:[
                        {
                            ro_time:{$gte:start_date}
                        },
                        {
                            ro_time:{$lte:start_date}
                        },
                        { 
                            ro_id_user: {$in:array}
                        },
                        {
                            ro_id_group:0
                        }
                    ]
                },
            },
            {
                $lookup: { 
                    from: 'TinhluongThietLap', 
                    localField: 'ro_id_tl', 
                    foreignField: 'tl_id', 
                    as: 'TinhluongThietLap' 
                } 
            },
            {
                $project:{
                    ro_time:1,
                    ro_price:1,
                    ro_so_luong:1,
                    ro_id_user:1,
                    ro_id_lr:1,
                    ro_id_tl:1,
                    ro_note:1,
                    ro_kpi_active:1,
                    "TinhluongThietLap.tl_hoahong":1,
                    "TinhluongThietLap.tl_chiphi":1,
                    "TinhluongThietLap.tl_kpi_yes":1,
                    "TinhluongThietLap.tl_kpi_no":1,
                    "TinhluongThietLap.tl_phan_tram":1,
                    "TinhluongThietLap.tl_money_min":1,
                    "TinhluongThietLap.tl_money_max":1,
                }
            }
        ]);

        // lấy hoa hồng nhóm
        let list_hoa_hong_nhom = await TinhluongRose.aggregate([
            {
                $match:{
                    $and:[
                        {
                            ro_time:{$gte:start_date}
                        },
                        {
                            ro_time:{$lte:start_date}
                        },
                        { 
                            ro_id_user: 0
                        },
                        {
                            ro_id_com:cp
                        }
                    ]
                },
            },
            {
                $lookup: { 
                    from: 'TinhluongThietLap', 
                    localField: 'ro_id_tl', 
                    foreignField: 'tl_id', 
                    as: 'TinhluongThietLap' 
                } 
            },
            {
                $project:{
                    ro_id:1,
                    ro_time:1,
                    ro_price:1,
                    ro_so_luong:1,
                    ro_id_lr:1,
                    ro_id_tl:1,
                    ro_note:1,
                    ro_kpi_active:1,
                    "TinhluongThietLap.tl_hoahong":1,
                    "TinhluongThietLap.tl_chiphi":1,
                    "TinhluongThietLap.tl_kpi_yes":1,
                    "TinhluongThietLap.tl_kpi_no":1,
                    "TinhluongThietLap.tl_phan_tram":1,
                    "TinhluongThietLap.tl_money_min":1,
                    "TinhluongThietLap.tl_money_max":1,
                }
            }
        ]);

        for(let q=0; q < array.length ; q++){
            let ep_id = array[q];
            //lấy mức lương hiện tại và lương đóng bảo hiểm
            let luong = 0;
            let luong_bh = 0;
            let data_salary = list_data_salary_total.filter((e)=> e.sb_id_user == ep_id);
            data_salary = data_salary.sort((a, b) => {
                return b.sb_time_up - a.sb_time_up;
            });
            if(data_salary && data_salary.length){
                luong = data_salary[0].sb_salary_basic;
                luong_bh = data_salary[0].sb_salary_bh
            }

            // lấy dữ liệu hợp đồng 
            let data_contract = list_data_contract.filter((e)=> e.con_id_user == ep_id);
            data_contract = data_contract.sort((a, b) => {
                return b.con_time_up - a.con_time_up;
            });
            // let data_contract = await Tinhluong365Contract.find(
            //     {
            //         con_id_user:ep_id,
            //         con_time_up:{$lte:start_date},
            //         $or:[
            //             {con_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
            //             {con_time_end:{$lte:end_date}},
            //         ]
            //     }
            // ).sort({con_time_up:-1}).limit(1).lean();
            if(data_contract && data_contract.length){
                pt_hop_dong = data_contract[0].con_salary_persent
            };

            // Lấy khoản đóng góp
            let donate = '';
            let donate_data = list_donate_data.filter((e)=> e.don_id_user = ep_id)
            // let donate_data = TinhluongDonate.find(
            //     {
            //         don_id_user:ep_id,
            //         don_time_end:{$lte:end_date},
            //         don_time_active:{$lte:start_date}
            //     },
            //     {don_price:1}
            // ).lean();
            for(let i = 0; i < donate_data.length; i++){
                donate = `${donate}${donate_data[i].don_price}`
            }

            //lấy thưởng phạt
            let thuong= 0;
            let phat = 0;
            let thuong_phat_data = list_thuong_phat_data.filter((e)=> e.pay_id_user == ep_id);
            // let thuong_phat_data = await Tinhluong365ThuongPhat.find(
            //     {
            //         pay_id_user: ep_id,
            //         pay_month:month,
            //         pay_year:year,
            //         pay_day:{$gte:start_date},
            //     },
            //     {
            //         pay_id:1,
            //         pay_price:1,
            //         pay_case:1,
            //         pay_status:1
            //     }
            // ).lean();
            if(thuong_phat_data && thuong_phat_data.length){
                for(let i = 0; i <thuong_phat_data.length; i++){
                    if(thuong_phat_data[i].pay_status == '1'){
                        thuong = thuong + thuong_phat_data[i].pay_price
                    }
                    else{
                        phat = phat + thuong_phat_data[i].pay_price
                    }
                }
            }

            //lấy số công chuẩn
            cong_chuan = cong_chuan_congty;

            // lấy lịch làm việc của tháng đó 
            let data_circle = list_data_circle.filter((e)=> e.ep_id == ep_id);

            // lấy dữ liệu chấm công 
            let data_time_sheet = list_data_time_sheet.filter((e)=> e.ep_id == ep_id);


            //phạt nghỉ k đúng quy định
            //có lịch mà không chắm công 
            //không chấm công không phép 
            let data_ko_cc = [];
            let data_ko_cc_co_phep = [];
            let tien_phat_nghi_khong_phep = 0;

            // lấy số ca có lịch làm việc mà không chấm công 
            for(let i = 0; i <data_circle.length; i++ ){
                let shift_id_check = data_circle[i].shift_id;
                let check = data_time_sheet.find((e)=>(
                    (e.at_time.getDate() ==  data_circle[i].date.getDate()) && (e.shift_id == shift_id_check)
                )
                );
                if(!check){
                    let check2 = data_ko_cc.find((e)=>e.shift_id == shift_id_check);
                    if(check2){
                        data_ko_cc = data_ko_cc.filter((e)=> e.shift_id != shift_id_check)
                        data_ko_cc.push({
                            shift_id: shift_id_check,
                            count:check2.count +1
                        })
                    }
                    else{
                        data_ko_cc.push({
                            shift_id: shift_id_check,
                            count:0
                        })
                    }
                }
            }

            let list_de_xuat_duyet = list_de_xuat_duyet_congty.filter((e)=> e.id_user == ep_id);
            if(list_de_xuat_duyet.length){
                for(let i = 0; i < list_de_xuat_duyet.length; i++){
                    let dexuat = list_de_xuat_duyet[i];
                    // đề xuất chưa được duyệt 
                    // if(dexuat.type_duyet == 6 && dexuat.nghi_phep){
                    //     let nd_nghi = dexuat.nghi_phep;
                    //     let bd_nghi = nd_nghi.bd_nghi;
                    //     let kt_nghi = nd_nghi.kt_nghi;
                    //     // lấy lịch làm việc trong những ngày nghỉ 
                    //     let data_circle_nghi = data_circle.filter((e)=> (e.date <= kt_nghi) && (e.date >= bd_nghi) );
                    //     // tính số ca nghỉ không phép khi đề xuất không được duyệt bằng cách check xem có lịch sử chấm công trong ca làm việc trong lịch làm việc không
                    //     for(let j=0; j<data_circle_nghi.length; j++){
                    //          let data_time_sheet_nghi = data_time_sheet.find((e)=>
                    //            (e.at_time.getDate() ==  data_circle_nghi[j].date.getDate()) && (e.shift_id == data_circle_nghi.shift_id)
                    //          );
                    //          if(!data_time_sheet_nghi){
                    //             so_ca_nghi_khong_phep = so_ca_nghi_khong_phep + 1;
                    //          }
                    //     } 
                    // }
                    // nếu đề xuất được duyệt 
                    if(dexuat.type_duyet == 5 && dexuat.noi_dung.nghi_phep){
                        let nd_nghi = dexuat.nghi_phep;
                        let bd_nghi = nd_nghi.bd_nghi;
                        let kt_nghi = nd_nghi.kt_nghi;
                        // lấy lịch làm việc trong những ngày xin phep 
                        let data_circle_nghi = data_circle.filter((e)=> (e.date <= kt_nghi) && (e.date >= bd_nghi) );
                        if(dexuat.noi_dung.nghi_phep.loai_np == 1){
                            so_ca_kcc_van_tinh_cong = data_circle_nghi.length;
                        }
                        // tính số ca nghỉ không phép khi đề xuất không được duyệt bằng cách check xem có lịch sử chấm công trong ca làm việc trong lịch làm việc không
                        for(let j=0; j<data_circle_nghi.length; j++){
                            let shift_id_check = data_circle_nghi[i].shift_id;
                            let data_time_sheet_nghi = data_time_sheet.find((e)=>
                            (e.at_time.getDate() ==  data_circle_nghi[j].date.getDate()) && (e.shift_id == data_circle_nghi.shift_id)
                            );
                            // không có dữ liệu chấm công 
                            if(!data_time_sheet_nghi){
                                let check2 = data_ko_cc_co_phep.find((e)=>e.shift_id == shift_id_check);
                                if(check2){
                                    data_ko_cc_co_phep = data_ko_cc.filter((e)=> e.shift_id != shift_id_check)
                                    data_ko_cc_co_phep.push({
                                        shift_id: shift_id_check,
                                        count:check2.count +1
                                    })
                                }
                                else{
                                    data_ko_cc_co_phep.push({
                                        shift_id: shift_id_check,
                                        count:0
                                    })
                                }
                            }
                        } 
                    }
                }
            }

            for(let i=0; i<data_ko_cc.length; i++){
                let co_phep_count = 0;
                let shift_id_check = data_ko_cc[i].shift_id;
                let co_phep = data_ko_cc_co_phep.find((e)=> e.shift_id == shift_id_check);
                if(co_phep){
                    co_phep_count = co_phep.count;
                };
                let k_phep = data_ko_cc - co_phep_count;
                let data_phat_nghi_ko_phep = await TinhluongPhatCa.find(
                    {
                        pc_type:1,
                        pc_time:{$lte:start_date},
                        pc_shift:shift_id_check
                    },
                    {   
                        pc_money: 1
                    }
                ).sort({pc_time:-1}).limit(1).lean();
                if(data_phat_nghi_ko_phep.length){
                    tien_phat_nghi_khong_phep = k_phep * data_phat_nghi_ko_phep[0].pc_money;
                }
            }

            //lấy phạt đi muộn về sớm
            let tien_phat_muon = 0;
            let cong_phat_muon = [];
            let data_late_early = list_data_late_early.filter((e)=> e.ep_id == ep_id);
            console.log(data_late_early)
            if(data_late_early.length){
                for(let i = 0; i < data_late_early.length; i++){
                    let obj = data_late_early[i];
                    let cong;
                    let tempt = Math.round((new Date(obj.check_out) - new Date(obj.check_in)) / 1000)
                    if(     (new Date(obj.check_out) > new Date('1970-01-01T00:00:00.000+00:00')) 
                        && (new Date(obj.check_in)) > new Date('1970-01-01T00:00:00.000+00:00')
                        && (tempt > 1800)
                    ){
                        cong = 1;
                    }
                    else{
                        cong = 0;
                    };
                    if(cong){
                        if(obj.early && obj.early_second){
                            let list_pm = await TinhluongPhatMuon.find(
                                {
                                    pm_id_com:cp,
                                    pm_type:2,
                                    pm_time_begin:{$lte:start_date},
                                    // $or:[
                                    //     {pm_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
                                    //     {pm_time_end:{$lte:end_date}}
                                    // ],
                                    pm_shift:obj.shift_id,
                                    pm_minute :{$lte:obj.early}
                                }
                            ).sort({pm_minute:-1}).limit(1).lean();
                            if(list_pm.length){
                                list_pm = list_pm.filter((e)=> (e.pm_time_end == null)|| (e.pm_time_end < end_date) || (e.pm_time_end == new Date('1970-01-01T00:00:00.000+00:00')))
                                let pm_info = list_pm[0];
                                if(pm_info.pm_type_phat == 1){
                                    tien_phat_muon = tien_phat_muon + pm_info.pm_monney
                                }
                                else{
                                    cong_phat_muon.push({
                                        date:obj.ts_date,
                                        shift_id:shift_id,
                                        cong:pm_info.pm_monney,
                                        addition:obj
                                    })
                                }
                            }
                        }
                        if(obj.late && obj.late_second){
                            let list_pm = await TinhluongPhatMuon.find(
                                {
                                    pm_id_com:cp,
                                    pm_type:2,
                                    pm_time_begin:{$lte:start_date},
                                    // $or:[
                                    //     {pm_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
                                    //     {pm_time_end:{$lte:end_date}}
                                    // ],
                                    pm_shift:obj.shift_id,
                                    pm_minute :{$lte:obj.late}
                                }
                            ).sort({pm_minute:-1}).limit(1).lean();
                            if(list_pm.length){
                                list_pm = list_pm.filter((e)=> (e.pm_time_end == null)|| (e.pm_time_end < end_date) || (e.pm_time_end == new Date('1970-01-01T00:00:00.000+00:00')));
                                let pm_info = list_pm[0];
                                if(pm_info.pm_type_phat == 1){
                                    tien_phat_muon = tien_phat_muon + pm_info.pm_monney
                                }
                                else{
                                    cong_phat_muon.push({
                                        date:obj.ts_date,
                                        shift_id:shift_id,
                                        cong:pm_info.pm_monney,
                                        addition:obj
                                    })
                                }
                            }
                        }
                    }
                }
            }
            console.log('tien_phat_muon',tien_phat_muon)
            // lấy công thực
            let luong_thuc = 0;
            let luong_sau_phat = 0;
            let cong_thuc = 0;
            let cong_sau_phat = 0;
            let so_cong_phat_muon = 0;
            let count_real_works = list_count_real_works.filter((e)=> e.ep_id == ep_id)


            // lấy data lương 
            let list_data_salary = data_salary;
            // lấy từng đối tượng để sử lý trường hợp sửa lương giữa tháng 
            //console.log("Dữ liệu công thực",count_real_works)
            if(count_real_works.length && data_contract.length){
                for(let i = 0; i < count_real_works.length;i++){
                    cong_thuc = cong_thuc + count_real_works[i].num_to_calculate;
                    cong_sau_phat = cong_sau_phat + count_real_works[i].num_to_calculate;
                    let cong_them = count_real_works[i].num_to_calculate;
                    let cong_data = count_real_works[i];
                    // công 1 ngày sau phạt muộn => có công mới phạt 
                    let list_cong_phat = cong_phat_muon.filter((e)=> ( e.date.getDate() == cong_data.ts_date.getDate() ));
                    for(let j = 0; j < list_cong_phat.length; j++){
                        if(list_cong_phat[j].cong){
                            // cong_thuc = cong_thuc - list_cong_phat[j].cong;
                            cong_sau_phat= cong_sau_phat - list_cong_phat[j].cong;
                            cong_them = cong_them - list_cong_phat[j].cong;
                            so_cong_phat_muon = so_cong_phat_muon + list_cong_phat[j].cong;
                        }
                    }
                    // lấy hợp đồng 
                    let contract_info = data_contract.find((e)=>
                        (
                          e.con_time_end.getTime() == new Date("1970-01-01T00:00:00.000+00:00").getTime() || e.con_time_end == null || e.con_time_end.getTime() >= cong_data.ts_date.getTime()
                        )
                        && (e.con_time_up.getDate() <= cong_data.ts_date.getDate())
                    );
                    if(contract_info){
                        let phan_tram_hop_dong = Number(contract_info.con_salary_persent);
                        let data_luong = list_data_salary.find((e)=>
                           (e.sb_time_up <= cong_data.ts_date)
                        );
                        if(data_luong){
                            luong_thuc = luong_thuc + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * count_real_works[i].num_to_calculate ;
                            luong_sau_phat = luong_sau_phat + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * cong_them
                        }
                    }

                }
            }

            // lấy công ghi nhận thêm 
            let get_dx_cong_tl365 = list_get_dx_cong_tl365.filter((e)=> e.id_user == ep_id);
            let cong_xn_them = 0;
            for(let i=0; i<get_dx_cong_tl365.length; i++){
                let data_xnc = get_dx_cong_tl365[i];
                let shiftId = data_xnc.xac_nhan_cong.ca_xnc;
                if(shiftId){
                    let data_shift_xnc = await Shift.findOne({shift_id:Number(shiftId)},{num_to_calculate:1}).lean();
                    if(data_shift_xnc){
                        cong_xn_them = cong_xn_them + data_shift_xnc.num_to_calculate;
                        // cộng lương vào lương thực luôn 
                        let contract_info = list_contract.find((e)=>
                            (e.con_time_end.getDate() >= data_xnc.xac_nhan_cong.time_xnc.getDate())
                            && (e.con_time_up.getDate() <= data_xnc.xac_nhan_cong.time_xnc.getDate())
                        );
                        if(contract_info){
                            let phan_tram_hop_dong = Number(contract_info.con_salary_persent);
                            let data_luong = list_data_salary.find((e)=>
                            (e.sb_time_up <= data_xnc.xac_nhan_cong.time_xnc)
                            );
                            if(data_luong){
                                luong_thuc = luong_thuc + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * data_shift_xnc.num_to_calculate ;
                                luong_sau_phat = luong_sau_phat + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * data_shift_xnc.num_to_calculate ;
                            }
                        }
                    }
                }
            }

            //lấy nghỉ thưởng nghỉ lễ => Đang Không dùng 
            let luong_nghi_le = 0;

            // tiền tạm ứng => để sau 
            let tien_tam_ung = 0;
            //tiền phúc lợi 
            let tien_phuc_loi_thue = 0;
            let tien_phuc_loi = 0;
            let data_phuc_loi = list_data_phuc_loi.filter((e)=> e.cls_id_user == ep_id)
            if(data_phuc_loi.length){
                for(let i = 0; i < data_phuc_loi.length ; i++){
                    if(data_phuc_loi[i].TinhluongListClass.length){
                        tien_phuc_loi = tien_phuc_loi + Number(data_phuc_loi[i].TinhluongListClass[0].cl_salary)
                        if(data_phuc_loi[i].TinhluongListClass[0].cl_type_tax == 1){
                            tien_phuc_loi_thue = tien_phuc_loi_thue +  Number(data_phuc_loi[i].TinhluongListClass[0].cl_salary);
                        }
                    }
                }
            }

            //tiền phụ cấp
            let tien_phu_cap= 0;
            let tien_phu_cap_thue = 0; 
            let cong_max = 0;
            let ratio_check = 0;
            let data_phu_cap = list_data_phu_cap.filter((e)=> e.cls_id_user == ep_id)
            if(data_phu_cap.length){
                for(let i = 0; i < data_phu_cap.length; i++){
                    if(data_phu_cap[i].TinhluongListClass && data_phu_cap[i].TinhluongListClass.length){
                        let cong_pc = 0;
                        if(cong_max >= cong_chuan){
                            cong_pc = cong_chuan;
                            break;
                        }
                        for(let j = 0; j < count_real_works.length; j++){
                            if(data_phu_cap[i].TinhluongListClass.length){
                                let check_time = count_real_works[j].ts_date;
                                let flag = false; 
                                if(
                                    (check_time >= data_phu_cap[i].cls_day)
                                    && ( (check_time <= data_phu_cap[i].cls_day_end)
                                        || (data_phu_cap[i].cls_day_end == new Date('1970-01-01T00:00:00.000+00:00'))
                                    )
                                    && ( check_time >= data_phu_cap[i].TinhluongListClass[0].cl_day )
                                    && ( (check_time <= data_phu_cap[i].TinhluongListClass[0].cl_day_end) ||
                                        (data_phu_cap[i].TinhluongListClass[0].cl_day_end == new Date('1970-01-01T00:00:00.000+00:00'))
                                    )
                                ){
                                    cong_max = cong_max + count_real_works[j].num_to_calculate;
                                    if(cong_max >= cong_chuan){
                                        cong_pc = cong_chuan;
                                    }
                                };
                            }
                        };
                        if(ratio_check > 0){
                            let cong_check = (1-ratio_check) * cong_chuan;
                            if(cong_pc >= cong_check){
                                cong_pc = cong_check
                            }
                        }
                        let ratio = cong_pc / cong_chuan;
                        ratio_check = ratio_check + ratio;

                        if(ratio > 1){
                            ratio = 1;
                        }
                        else {
                            ratio = ratio.toFixed(3);
                        }
                        tien_phu_cap = tien_phu_cap + data_phu_cap[i].TinhluongListClass[0].cl_salary * ratio;
                        if(data_phu_cap[i].TinhluongListClass[0].cl_type_tax == 1){
                            tien_phu_cap_thue = tien_phu_cap_thue + data_phu_cap[i].TinhluongListClass[0].cl_salary * ratio;
                        }
                    }
                }
            }

            // tiền phụ cấp theo ca và phạt nghỉ không phép

            // tiền bảo hiểm 
            let tong_bao_hiem = 0;
            // $qr_list_insrc = new db_query("SELECT cls_id_user,cls_id_cl,fs_repica,max(`cls_day`) FROM `tb_class`
            //     INNER JOIN tb_list_class ON tb_class.cls_id_cl = tb_list_class.cl_id
            //     INNER JOIN tb_form_salary ON cl_id_form = fs_id
            //     WHERE cls_id_user = '" . $id . "' AND cls_id_com = '" . $cp . "' AND 
            //     tb_list_class.cl_type = '2' AND tb_class.cls_day <= '$end_date' AND (tb_class.cls_day_end IS NULL OR tb_class.cls_day_end >='$start_date') GROUP BY `cl_id` ");
            let data_bao_hiem_final = []
            let data_bao_hiem = list_data_bao_hiem.filter((e)=> e.cls_id_user == ep_id)
            for(let i = 0; i <data_bao_hiem.length; i++){
                if(data_bao_hiem[i].TinhluongListClass && data_bao_hiem[i].TinhluongListClass.length){
                    if(data_bao_hiem[i].TinhluongListClass[0].cl_id_form){
                        let data_form = await TinhluongFormSalary.findOne(
                            {fs_id:data_bao_hiem[i].TinhluongListClass[0].cl_id_form},
                            {fs_repica:1}
                        ).lean();
                        if(data_form){
                            data_bao_hiem_final.push({
                                cls_id_user:data_bao_hiem[i].cls_id_user,
                                cls_id_cl:data_bao_hiem[i].cls_id_cl,
                                cls_day:data_bao_hiem[i].cls_day,
                                cls_day_end:data_bao_hiem[i].cls_day_end,
                                fs_repica:data_form.fs_repica
                            });
                        }
                    }
                }
            }
            // for(let i=0; i < data_bao_hiem_final.length ; i++){
            // }

            // lấy các loại tiền khác
            let tien_khac = 0;
            // hoa hồng cá nhân của nhân viên
            let hoa_hong_ca_nhan = list_hoa_hong_ca_nhan.filter((e)=> e.ro_id_user == ep_id);
            let tong_hoa_hong = 0;
            let hoa_hong_1 = 0;
            let hoa_hong_2 = 0;
            let hoa_hong_3 = 0;
            let hoa_hong_4 = 0;
            let hoa_hong_5 = 0;
            for(let i = 0; i <hoa_hong_ca_nhan.length ; i++){
                let hh_data = hoa_hong_ca_nhan[i];
                if(hh_data.TinhluongThietLap){
                    let ro_time = hh_data.ro_time;
                    let ro_price = hh_data.ro_price;
                    let ro_so_luong = hh_data.ro_so_luong;
                    let ro_id_user = hh_data.ro_id_user;
                    let ro_id_lr = hh_data.ro_id_lr;
                    let ro_note = hh_data.ro_note;
                    let ro_kpi_active = hh_data.ro_kpi_active;
                    let tl_hoahong = hh_data.TinhluongThietLap.tl_hoahong;
                    let tl_chiphi = hh_data.TinhluongThietLap.tl_chiphi;
                    let tl_kpi_yes = hh_data.TinhluongThietLap.tl_kpi_yes;
                    let tl_kpi_no = hh_data.TinhluongThietLap.tl_kpi_no;
                    let tl_phan_tram = hh_data.TinhluongThietLap.tl_phan_tram;
                    let tl_money_min = hh_data.TinhluongThietLap.tl_money_min;
                    let tl_money_max = hh_data.TinhluongThietLap.tl_money_max;
                    if(ro_id_lr == 1){
                        tong_hoa_hong = tong_hoa_hong + ro_price;
                        hoa_hong_1 = hoa_hong_1 + ro_price;
                    };
                    if(ro_id_lr == 2){
                        if(
                            (ro_price >= tl_money_min)
                            && (ro_price >= tl_money_max)
                        ){
                            tong_hoa_hong = tong_hoa_hong + ro_price*tl_phan_tram /100;
                            hoa_hong_2 = hoa_hong_2 + ro_price*tl_phan_tram /100;
                        }
                    }
                    if(ro_id_lr == 3){
                        tong_hoa_hong = tong_hoa_hong + ro_price - (tl_chiphi * ro_so_luong );
                        hoa_hong_3 = hoa_hong_3 + ro_price - (tl_chiphi * ro_so_luong );
                    }
                    if(ro_id_lr == 4){
                        tong_hoa_hong = tong_hoa_hong + tl_hoahong * ro_so_luong ;
                        hoa_hong_4 = hoa_hong_4 + tl_hoahong * ro_so_luong;
                    }
                    if(ro_id_lr == 5){
                        if(ro_kpi_active == 1){
                            tong_hoa_hong = tong_hoa_hong + tl_kpi_yes ;
                            hoa_hong_5 = hoa_hong_5 + tl_kpi_yes;
                        }
                        else{
                            tong_hoa_hong = tong_hoa_hong + tl_kpi_no ;
                            hoa_hong_5 = hoa_hong_5 + tl_kpi_no;
                        }
                    }
                }

            }

            // hoa hồng nhóm của nhân viên
            let hoa_hong_nhom = list_hoa_hong_nhom;
            for(let i = 0; i <hoa_hong_nhom.length; i++) {
                let hh_data = hoa_hong_nhom[i];
                if(hh_data.TinhluongThietLap){
                    let ro_id = hh_data.ro_id;
                    let ro_time = hh_data.ro_time;
                    let ro_price = hh_data.ro_price;
                    let ro_so_luong = hh_data.ro_so_luong;
                    let ro_id_lr = hh_data.ro_id_lr;
                    let ro_note = hh_data.ro_note;
                    let ro_kpi_active = hh_data.ro_kpi_active;
                    let tl_hoahong = hh_data.TinhluongThietLap.tl_hoahong;
                    let tl_chiphi = hh_data.TinhluongThietLap.tl_chiphi;
                    let tl_kpi_yes = hh_data.TinhluongThietLap.tl_kpi_yes;
                    let tl_kpi_no = hh_data.TinhluongThietLap.tl_kpi_no;
                    let tl_phan_tram = hh_data.TinhluongThietLap.tl_phan_tram;
                    let tl_money_min = hh_data.TinhluongThietLap.tl_money_min;
                    let tl_money_max = hh_data.TinhluongThietLap.tl_money_max;
                    let g_user = await TinhluongPercentGr.findOne(
                        {
                        pr_rose:ro_id,
                        pr_id_user:ep_id,
                        pr_percent:{$ne:0}
                        },
                        {
                            pr_percent: 1
                        }
                    ).lean();
                    if(g_user){
                        let pr_percent = g_user.pr_percent;
                        pr_percent = pr_percent / 100;
                        if(ro_id_lr == 1){
                            tong_hoa_hong = tong_hoa_hong + ro_price;
                            hoa_hong_1 = hoa_hong_1 + ro_price;
                        };
                        if(ro_id_lr == 2){
                            if(
                                (ro_price >= tl_money_min)
                                && (ro_price >= tl_money_max)
                            ){
                                tong_hoa_hong = tong_hoa_hong + ro_price*tl_phan_tram /100*pr_percent;
                                hoa_hong_2 = hoa_hong_2 + ro_price*tl_phan_tram /100*pr_percent;
                            }
                        }
                        if(ro_id_lr == 3){
                            tong_hoa_hong = tong_hoa_hong + ro_price - (tl_chiphi * ro_so_luong *pr_percent );
                            hoa_hong_3 = hoa_hong_3 + ro_price - (tl_chiphi * ro_so_luong *pr_percent);
                        }
                        if(ro_id_lr == 4){
                            tong_hoa_hong = tong_hoa_hong + tl_hoahong * ro_so_luong *pr_percent ;
                            hoa_hong_4 = hoa_hong_4 + tl_hoahong * ro_so_luong *pr_percent;
                        }
                        if(ro_id_lr == 5){
                            if(ro_kpi_active == 1){
                                tong_hoa_hong = tong_hoa_hong + tl_kpi_yes*pr_percent ;
                                hoa_hong_5 = hoa_hong_5 + tl_kpi_yes*pr_percent;
                            }
                            else{
                                tong_hoa_hong = tong_hoa_hong + tl_kpi_no*pr_percent ;
                                hoa_hong_5 = hoa_hong_5 + tl_kpi_no*pr_percent;
                            }
                        }
                    }
                }
            }

            // tính thuế
            // $tong_luong = $luong_sau_phat + $luong_nghi_le + $tong_hoa_hong - $tien_tam_ung - $tien_phat_muon 
            //+ $thuong - $phat - $phat_nghi_khong_phep - $tien_phat_nghi + $tien_phuc_loi + 
            //$tien_phu_cap + $tien_phu_cap_theo_ca - $tong_bao_hiem + $tien_khac + $nghi_co_luong + $cong_tien;

            // tiền phạt muộn có 2 loại 
            // - loại phạt tiền nằm trong tien_phat_muon
            // - lọai phạt công đã được trừ trong lúc tổng hợp lương thực 
            let tong_luong = luong_sau_phat + luong_nghi_le + tong_hoa_hong - tien_tam_ung - tien_phat_muon + thuong - phat - tien_phat_nghi_khong_phep + tien_phuc_loi + tien_phu_cap - tong_bao_hiem

            // lương đã trả
            let luong_da_tra = 0;
            let cong_theo_tien = 0;
            let cong_ghi_nhan = 0;
            let cong_nghi_phep = 0;
            let tong_cong_nhan = 0;
            let luong_bao_hiem = 0;
            let cong_phat_di_muon_ve_som = 0;
            let phat_nghi_sai_quy_dinh = 0;
            let phu_cap_theo_ca = 0;
            let thue = 0;
            let tien_thuc_nhan = tong_luong;
            listResult.push({
                ep_id:ep_id,
                luong_co_ban:luong,
                phan_tram_hop_dong:data_contract.length ? Number(data_contract[0].con_salary_persent) : 0,
                cong_chuan:cong_chuan_congty,
                cong_thuc,
                cong_sau_phat,
                cong_theo_tien,
                cong_ghi_nhan,
                cong_nghi_phep,
                tong_cong_nhan,
                luong_thuc,
                luong_sau_phat,
                luong_bao_hiem,
                tien_phat_muon,
                cong_phat_di_muon_ve_som,
                tong_hoa_hong,
                tien_tam_ung,
                thuong,
                luong_nghi_le,
                phat,
                tien_phat_nghi_khong_phep,
                phat_nghi_sai_quy_dinh,
                tien_phuc_loi,
                tien_phu_cap,
                phu_cap_theo_ca,
                tong_bao_hiem,
                tien_khac,
                thue,
                tien_thuc_nhan,
                luong_da_tra,
            })
        }
        return res.status(200).json({ data: true, message: "success",listResult,listUser});
    }catch (error) {
        console.error("controller/tinhluong/congty show_bangluong_nv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// quản lý thuế 

// thuế cl_type = 1
exports.takeinfo_tax_com = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        let tax_list = await TinhluongListGroup.find({lgr_id_com:com_id});
        let tax_list_detail = await TinhluongListClass.aggregate([
            {
                $match:{
                    cl_type:1,
                    cl_com:com_id
                }
            },
            {
                $lookup:{
                    from: 'TinhluongFormSalary', 
                    localField: 'cl_id_form', 
                    foreignField: 'fs_id', 
                    as: 'TinhluongFormSalary'
                }
            }
        ])
        return res.status(200).json({ data: true, message: "success",tax_list,tax_list_detail});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.insert_category_tax = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        const fs_type = 1; // loai bao hiem 
        const fs_id_com = com_id;
        const fs_name = String(req.body.fs_name);  
        const fs_data = Number(req.body.fs_data); 
        const fs_repica = String(req.body.fs_repica);  
        const fs_note = String(req.body.fs_note); 
        
        const cl_name = String(req.body.cl_name); 
        const cl_note = String(req.body.cl_note); 
        const cl_type = 1;
        const cl_com = com_id;

        let data_counter = await Counter.findOne({TableId:'TinhluongFormSalaryId'}).lean();
        let fs_id = data_counter.Count + 1;
        let form_salary = new TinhluongFormSalary(
            { 
                fs_id,
                fs_type,
                fs_id_com,
                fs_name,
                fs_data,
                fs_repica,
                fs_note
            }
        );
        let new_form_salary = await form_salary.save();
        const cl_id_form = new_form_salary.fs_id;
        
        data_counter = await Counter.findOne({TableId:'TinhluongListClassId'}).lean();
        let cl_id = data_counter.Count + 1;
         
        let list_class = new TinhluongListClass({
            cl_id,
            cl_name,
            cl_note,
            cl_type,
            cl_com,
            cl_id_form
        });

        let new_list_class = await list_class.save();

        return res.status(200).json({ data:{
            thong_tin_bao_hiem:new_form_salary,
            bao_hiem_cong_ty:list_class
        }, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty insert_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
// thêm thành viên vào nhóm tiền khác 
exports.them_nv_nhom_tax = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        const cls_id_com = Number(req.body.cls_id_com);
        const cls_id_user = Number(req.body.cls_id_user);
        const cls_day = new Date(req.body.cls_day);
        const cls_day_end = new Date(req.body.cls_day_end);
        let dataListClass = await TinhluongListClass.findOne({cl_id:cls_id_cl});
        if(dataListClass && (dataListClass.cl_com == cls_id_com)){
            let data_counter = await Counter.findOne({TableId:'TinhluongClassId'});
            if(data_counter){
                let cls_id = data_counter.Count + 1;
                await TinhluongClass.deleteMany({cls_id_cl,cls_id_user,cls_id_com});
                let obj = new TinhluongClass(
                    { 
                      cls_id,
                      cls_id_cl,
                      cls_id_user,
                      cls_day,
                      cls_id_com,
                      cls_day_end
                    }
                )
                let newobj = await obj.save();
                return res.status(200).json({ data: true, message: "success",newobj });
            }
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy danh sách thành viên 
exports.take_list_nv_tax = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        let listUser = await TinhluongClass.find({
            cls_id_cl
        },{cls_id_user:1}).lean();

        let array = [];
        for(let i = 0; i < listUser.length; i++){
            array.push(Number(listUser[i].cls_id_user));
        }
        let listUserFinal = await User.find({idQLC:{$in:array}},{password:0}).lean()
        return res.status(200).json({ data: true, message: "success",listUserFinal });
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// sửa hạn 
exports.edit_nv_tax = async (req, res) => {
    try{
        const cls_id_com = Number(req.body.cls_id_com);
        const cls_day = new Date(req.body.cls_day)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cls_day_end = new Date(req.body.cls_day_end)|| new Date('1970-01-01T00:00:00.000+00:00');
        const cls_id = Number(req.body.cls_id);
        if(cls_id){
            await TinhluongClass.updateOne(
                {
                    cls_id,
                    cls_id_com
                },
                {
                    $set:{
                        cls_day,
                        cls_day_end
                    }
                }
            );
            return res.status(200).json({ data: true, message: "success" });
        }
        else{
            return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
        }
    }catch (error) {
        console.error("controller/tinhluong/conty sua_nc_phuc_loi_tro_cap", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.delete_nv_tax = async (req, res) => {
    try{
        const cls_id_cl = Number(req.body.cls_id_cl);
        const cls_id_user = Number(req.body.cls_id_user);
        await TinhluongClass.deleteOne({
            cls_id_cl,
            cls_id_user
        })
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/conty them_nv_nhom", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


exports.update_tax_com = async (req, res) => {
    try{
        const cl_name = String(req.body.cl_name);
        const cl_note = String(req.body.cl_note);
        const cl_id = Number(req.body.cl_id);
        const fs_name = String(req.body.fs_name);
        const fs_data = String(req.body.fs_data);
        const fs_id = Number(req.body.fs_id);
        await TinhluongListClass.updateOne(
            {
                cl_id
            },
            {
                $set:{
                    cl_name,
                    cl_note
                }
            }
        );
        await TinhluongFormSalary.updateOne(
            {
                fs_id
            },
            {
                fs_name,
                fs_data
            }
        );
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty update_tax_com", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// danh sách đăng ký thuế của công ty 
exports.show_list_user_tax = async (req, res) => {
    try{
        const cls_id_com = Number(req.body.cls_id_com);
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        // lấy về 1 lượt => lưu dưới client rồi phân loại 
        let list_us = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {
                            $or:[
                                {cls_day_end:{$gte:start_date}},
                                {cls_day_end:new Date('1970-01-01T00:00:00.000+00:00')}
                            ]
                        },
                        {cls_day:{$lte:end_date}},
                        {cls_id_com:cls_id_com}
                    ]
                }
            },
            {
                $lookup:{
                    from: 'TinhluongListClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass'
                }
            },
            {
                $project:{
                    "cls_id_user":1,
                    "TinhluongListClass.cl_name":1,
                    "cls_id_cl":1,
                    "cls_day":1,
                    "TinhluongListClass.cl_id_form":1,
                    "TinhluongListClass.cl_type":1,
                    "TinhluongListClass.cl_active":1,
                    "cls_id":1,
                    "cls_day_end":1,
                }
            },
            {
                $match:{
                    "TinhluongListClass.cl_type":1,
                    "TinhluongListClass.cl_active":1
                }
            },
            {
                $lookup:{
                    from: 'TinhluongFormSalary', 
                    localField: 'TinhluongListClass.cl_id_form', 
                    foreignField: 'fs_id', 
                    as: 'TinhluongFormSalary'
                }
            },
            {
                $lookup:{
                    from: 'Users', 
                    localField: 'cls_id_user', 
                    foreignField: 'idQLC', 
                    as: 'Detail'
                }
            },
        ]);
        
        return res.status(200).json({ data: true, message: "success",list_us});
    }catch (error) {
        console.error("controller/tinhluong/congty update_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// danh sách công ty chưa đăng ký thuế 
exports.show_list_user_no_tax = async (req, res) => {
    try{
        const cls_id_com = Number(req.body.cls_id_com);
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        let listUser = await User.find(
            {"inForPerson.employee.com_id":cls_id_com},
            {idQLC:1}
        ).lean();
        let array = [];
        for(let i = 0; i < listUser.length; i++) {
            array.push(listUser[i].idQLC)
        }
        
        let list_us = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {
                            $or:[
                                {cls_day_end:{$gte:start_date}},
                                {cls_day_end:new Date('1970-01-01T00:00:00.000+00:00')}
                            ]
                        },
                        {cls_day:{$lte:end_date}},
                        {cls_day:{$gte:end_date}},
                        {cls_id_com:cls_id_com}
                    ]
                }
            },
            {
                $lookup:{
                    from: 'TinhluongListClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass'
                }
            },
            {
                $project:{
                    "cls_id_user":1,
                    "TinhluongListClass.cl_name":1,
                    "cls_id_cl":1,
                    "cls_day":1,
                    "TinhluongListClass.cl_id_form":1,
                    "TinhluongListClass.cl_type":1,
                    "TinhluongListClass.cl_active":1,
                    "cls_id":1,
                    "cls_day_end":1,
                }
            },
            {
                $match:{
                    "TinhluongListClass.cl_type":1,
                    "TinhluongListClass.cl_active":1
                }
            },
            {
                $project:{
                    "cls_id_user":1,
                }
            },
        ]);

        array = array.filter((a)=> !list_us.find((e)=> e.cls_id_user == a ));
        let listUserFinal = await User.find({
            idQLC:{$in:array}
        });
        return res.status(200).json({ data: true, message: "success",listUserFinal});
    }catch (error) {
        console.error("controller/tinhluong/congty update_insrc", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// quản lý chi trả lương 
exports.takeinfo_payment = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        let payment_list = await TinhluongPayment.find(
            {
                pay_for_time:{$gte:start_date},
                pay_for_time:{$lte:end_date},
                pay_com:com_id
            }
        ).sort({pay_id:-1});
        return res.status(200).json({ data: true, message: "success",payment_list});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_payment", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.insert_info_payment = async (req, res) => {
    try{
        const dp_use_id = Number(req.body.dp_use_id);
        const dp_pay_id = Number(req.body.dp_pay_id);
        const dp_com_id = Number(req.body.dp_com_id);

        const pay_name = String(req.body.pay_name);
        const pay_unit = Number(req.body.pay_unit);
        const pay_for_time = new Date(req.body.pay_for_time);
        const pay_time_start = new Date(req.body.pay_time_start);
        const pay_time_end = new Date(req.body.pay_time_end);
        const pay_for = Number(req.body.pay_for);
        const pay_com = Number(req.body.pay_com);

        let data_counter = await Counter.findOne({TableId:'TinhluongDetailPaymentId'});
        if(data_counter){
            let dp_id = data_counter.Count + 1;
            let obj = new TinhluongDetailPayment(
                { 
                  dp_id,
                  dp_use_id,
                  dp_pay_id,
                  dp_com_id
                }
            )
            await obj.save();
        }

        let data_counter2 = await Counter.findOne({TableId:'TinhluongPaymentId'});
        if(data_counter2){
            let pay_id = data_counter.Count + 1;
            let obj2 = new TinhluongPayment(
                { 
                  pay_id,
                  pay_name,
                  pay_unit,
                  pay_for_time,
                  pay_time_start,
                  pay_time_end,
                  pay_for,
                  pay_com
                }
            )
            await obj2.save();
        }
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_payment", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.updateinfo_payment = async (req, res) => {
    try{
        const pay_id = Number(req.body.pay_id);
        const pay_name = String(req.body.pay_name);
        const pay_unit = Number(req.body.pay_unit);
        const pay_for_time = new Date(req.body.pay_for_time);
        const pay_time_start = new Date(req.body.pay_time_start);
        const pay_time_end = new Date(req.body.pay_time_end);
        const pay_com = Number(req.body.pay_com);
        await TinhluongPayment.updateOne(
            {
                pay_id,
                pay_com
            },
            {
                $set:{
                    pay_name,
                    pay_unit,
                    pay_for_time,
                    pay_time_end,
                    pay_time_start
                }
            }
        )
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_payment", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// báo cáo công lương 
exports.takedata_salary_report = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        const cp = com_id;
        const dep_id = Number(req.body.dep_id) || 0;
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date);
        const month = Number(req.body.month);
        const year = Number(req.body.year);
        const limit = 10;
        const skip = Number(req.body.skip);
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));
        let listResult = [];
        let condition = {"inForPerson.employee.com_id":com_id};
        if(dep_id){
            condition = {"inForPerson.employee.com_id":com_id, "inForPerson.employee.dep_id":dep_id }
        }
        let listUser = await User.find(
            condition
        ).sort({_id:-1}).lean();
        let array = [];
        for(let i = 0; i < listUser.length; i++) {
            array.push(listUser[i].idQLC)
        }
        
        // take data for caculate 
        let list_data_salary_total = await Tinhluong365SalaryBasic.find(
            {
                sb_id_user:{$in:array},
                sb_time_up:{$lte:end_date}
            },
            {
                sb_salary_basic:1,
                sb_salary_bh:1,
                sb_id_user:1
            }
        ).sort({sb_time_up:-1}).lean();

        let list_data_contract = await Tinhluong365Contract.find(
            {
                con_id_user:{$in:array},
                con_time_up:{$lte:end_date},
                $or:[
                    {con_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
                    {con_time_end:{$gte:start_date}}
                ]
            },
            {con_salary_persent:1,con_id_user:1}
        ).sort({con_time_up:-1}).lean();

        let list_donate_data = await TinhluongDonate.find(
            {
                don_id_user:{$in:array},
                don_time_end:{$lte:end_date},
                don_time_active:{$lte:start_date}
            },
            {don_price:1,don_id_user:1}
        ).lean();

        let list_thuong_phat_data = await Tinhluong365ThuongPhat.find(
            {
                pay_id_user:{$in:array},
                pay_month:month,
                pay_year:year,
                pay_day:{$gte:start_date},
            },
            {
                pay_id:1,
                pay_price:1,
                pay_case:1,
                pay_status:1,
                pay_id_user:1
            }
        ).lean();

        let cong_chuan_congty = await NhanVienService.take_count_standard_works(cp,year,month);
        cong_chuan_congty = cong_chuan_congty.length;
        
        // lịch làm việc 
        let list_data_circle = await NhanVienService.get_circle_listem(array,cp,start_date,end_date);
        
        // dữ liệu chấm công 
        let list_data_time_sheet = await CC365_TimeSheet.find(
            {
                ep_id:{$in:array},
                $and:[
                    {
                        at_time:{$gte:start_date}
                    },
                    {
                        at_time:{$lte:end_date}
                    }
                ]
            },
            {
                shift_id:1,
                at_time:1,
                ep_id:1
            }
        ).lean(); 

        // dữ liệu đề xuất 
        let list_de_xuat_duyet_congty = await NhanVienService.get_de_xuat_tl365_congty(array,cp,start_date,end_date);
        
        // lấy phạt đi muộn về sớm ; trả về dạng mảng => dùng filter 
        let list_data_late_early = await NhanVienService.get_list_timekeeping_late_early_by_company(array,cp,start_date,end_date)
        
        // lấy công thực 
        let list_count_real_works = await NhanVienService.take_count_real_works_com(array,cp,start_date,end_date);
        
        // lấy công ghi nhận thêm 
        let list_get_dx_cong_tl365 = await NhanVienService.get_dx_cong_tl365_com(array,cp,start_date,end_date);

        // lấy phúc lợi 
        let list_data_phuc_loi = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {cls_id_user:{$in:array}},
                        {cls_day:{$lte:end_date}},
                        {cls_id_com:cp}
                    ]
                }
            },
            {   
                $lookup: { 
                    from: 'TinhluongClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass' 
                } 
            },
            {
                $match:{
                    $and:[
                        {"TinhluongListClass.cl_type":3},
                        {"TinhluongListClass.cl_day":{$lte:start_date}},
                        {$or:[
                            {"TinhluongListClass.cl_day_end":new Date('1970-01-01T00:00:00.000+00:00')},
                            {"TinhluongListClass.cl_day_end":{$gte:start_date}}
                        ]}
                    ]
                }
            },
            {
                $project:{
                    "TinhluongListClass.cl_salary":1,
                    "TinhluongListClass.cl_type_tax":1,
                    "cls_id_user":1
                }
            }
        ])

        // lấy phụ cấp 
        let list_data_phu_cap = await TinhluongClass.aggregate([
            {
                $match:{
                    cls_id_user:{$in:array},
                    cls_id_com:cp
                }
            },
            {   
                $lookup: { 
                    from: 'TinhluongClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cls_id_user', 
                    as: 'TinhluongListClass' 
                } 
            },
            {
                $match:{
                    $and:[
                        {"TinhluongListClass.cl_type":4},
                        {"TinhluongListClass.cl_day":{$lte:start_date}},
                        {$or:[
                            {"TinhluongListClass.cl_day_end":new Date('1970-01-01T00:00:00.000+00:00')},
                            {"TinhluongListClass.cl_day_end":{$gte:start_date}}
                        ]}
                    ]
                }
            },
            {
                $project:{
                    "TinhluongListClass.cl_salary":1,
                    "TinhluongListClass.cl_type_tax":1,
                    "TinhluongListClass.cl_day":1,
                    "TinhluongListClass.cl_day_end":1,
                    cls_day:1,
                    cls_day_end:1,
                    cls_id_user:1
                }
            }
        ]);

        // lấy bảo hiểm 
        let list_data_bao_hiem = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {cls_id_user:{$in:array}},
                        {cls_id_com:cp},
                        {cls_day:{$lte:end_date}},
                        {
                            $or:[
                                {cls_day_end:new Date('1970-01-01T00:00:00.000+00:00') },
                                {cls_day_end:{$gte:start_date}}
                            ]
                        }
                    ]
                }
            },
            {   
                $lookup: { 
                    from: 'TinhluongListClass', 
                    localField: 'cls_id_cl', 
                    foreignField: 'cl_id', 
                    as: 'TinhluongListClass' 
                } 
            },
            {
                $match:{
                    "TinhluongListClass.cl_type":2
                }
            },
            // {   
            //     $lookup: { 
            //         from: 'TinhluongFormSalary', 
            //         localField: "TinhluongListClass.cl_id_form", 
            //         foreignField: 'fs_id', 
            //         as: 'TinhluongListClass' 
            //     } 
            // },
            {
                $project:{
                    "cls_id_user":1,
                    "cls_id_cl":1,
                    TinhluongListClass:1,
                    cls_day:1,
                    cls_day_end:1
                }
            },
            {
                $sort:{
                    cls_day: -1
                }
            }
        ])

        // lấy hoa hồng cá nhân 
        let list_hoa_hong_ca_nhan = await TinhluongRose.aggregate([
            {
                $match:{
                    $and:[
                        {
                            ro_time:{$gte:start_date}
                        },
                        {
                            ro_time:{$lte:start_date}
                        },
                        { 
                            ro_id_user: {$in:array}
                        },
                        {
                            ro_id_group:0
                        }
                    ]
                },
            },
            {
                $lookup: { 
                    from: 'TinhluongThietLap', 
                    localField: 'ro_id_tl', 
                    foreignField: 'tl_id', 
                    as: 'TinhluongThietLap' 
                } 
            },
            {
                $project:{
                    ro_time:1,
                    ro_price:1,
                    ro_so_luong:1,
                    ro_id_user:1,
                    ro_id_lr:1,
                    ro_id_tl:1,
                    ro_note:1,
                    ro_kpi_active:1,
                    "TinhluongThietLap.tl_hoahong":1,
                    "TinhluongThietLap.tl_chiphi":1,
                    "TinhluongThietLap.tl_kpi_yes":1,
                    "TinhluongThietLap.tl_kpi_no":1,
                    "TinhluongThietLap.tl_phan_tram":1,
                    "TinhluongThietLap.tl_money_min":1,
                    "TinhluongThietLap.tl_money_max":1,
                }
            }
        ]);

        // lấy hoa hồng nhóm
        let list_hoa_hong_nhom = await TinhluongRose.aggregate([
            {
                $match:{
                    $and:[
                        {
                            ro_time:{$gte:start_date}
                        },
                        {
                            ro_time:{$lte:start_date}
                        },
                        { 
                            ro_id_user: 0
                        },
                        {
                            ro_id_com:cp
                        }
                    ]
                },
            },
            {
                $lookup: { 
                    from: 'TinhluongThietLap', 
                    localField: 'ro_id_tl', 
                    foreignField: 'tl_id', 
                    as: 'TinhluongThietLap' 
                } 
            },
            {
                $project:{
                    ro_id:1,
                    ro_time:1,
                    ro_price:1,
                    ro_so_luong:1,
                    ro_id_lr:1,
                    ro_id_tl:1,
                    ro_note:1,
                    ro_kpi_active:1,
                    "TinhluongThietLap.tl_hoahong":1,
                    "TinhluongThietLap.tl_chiphi":1,
                    "TinhluongThietLap.tl_kpi_yes":1,
                    "TinhluongThietLap.tl_kpi_no":1,
                    "TinhluongThietLap.tl_phan_tram":1,
                    "TinhluongThietLap.tl_money_min":1,
                    "TinhluongThietLap.tl_money_max":1,
                }
            }
        ]);

        for(let q=0; q < array.length ; q ++){
            let ep_id = array[q];
            //lấy mức lương hiện tại và lương đóng bảo hiểm
            let luong = 0;
            let luong_bh = 0;
            let data_salary = list_data_salary_total.filter((e)=> e.sb_id_user == ep_id);
            data_salary = data_salary.sort((a, b) => {
                return b.sb_time_up - a.sb_time_up;
            });
            if(data_salary && data_salary.length){
                luong = data_salary[0].sb_salary_basic;
                luong_bh = data_salary[0].sb_salary_bh
            }

            // lấy dữ liệu hợp đồng 
            let pt_hop_dong = '--';
            let data_contract = list_data_contract.filter((e)=> e.con_id_user == ep_id);
            // let data_contract = await Tinhluong365Contract.find(
            //     {
            //         con_id_user:ep_id,
            //         con_time_up:{$lte:start_date},
            //         $or:[
            //             {con_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
            //             {con_time_end:{$lte:end_date}},
            //         ]
            //     }
            // ).sort({con_time_up:-1}).limit(1).lean();
            if(data_contract && data_contract.length){
                pt_hop_dong = data_contract[0].con_salary_persent
            };

            // Lấy khoản đóng góp
            let donate = '';
            let donate_data = list_donate_data.filter((e)=> e.don_id_user = ep_id)
            // let donate_data = TinhluongDonate.find(
            //     {
            //         don_id_user:ep_id,
            //         don_time_end:{$lte:end_date},
            //         don_time_active:{$lte:start_date}
            //     },
            //     {don_price:1}
            // ).lean();
            for(let i = 0; i < donate_data.length; i++){
                donate = `${donate}${donate_data[i].don_price}`
            }

            //lấy thưởng phạt
            let thuong= 0;
            let phat = 0;
            let thuong_phat_data = list_thuong_phat_data.filter((e)=> e.pay_id_user == ep_id);
            // let thuong_phat_data = await Tinhluong365ThuongPhat.find(
            //     {
            //         pay_id_user: ep_id,
            //         pay_month:month,
            //         pay_year:year,
            //         pay_day:{$gte:start_date},
            //     },
            //     {
            //         pay_id:1,
            //         pay_price:1,
            //         pay_case:1,
            //         pay_status:1
            //     }
            // ).lean();
            if(thuong_phat_data && thuong_phat_data.length){
                for(let i = 0; i <thuong_phat_data.length; i++){
                    if(thuong_phat_data[i].pay_status == '1'){
                        thuong = thuong + thuong_phat_data[i].pay_price
                    }
                    else{
                        phat = phat + thuong_phat_data[i].pay_price
                    }
                }
            }

            //lấy số công chuẩn
            cong_chuan = cong_chuan_congty;

            // lấy lịch làm việc của tháng đó 
            let data_circle = list_data_circle.filter((e)=> e.ep_id == ep_id);

            // lấy dữ liệu chấm công 
            let data_time_sheet = list_data_time_sheet.filter((e)=> e.ep_id == ep_id);


            //phạt nghỉ k đúng quy định
            //có lịch mà không chắm công 
            //không chấm công không phép 
            let data_ko_cc = [];
            let data_ko_cc_co_phep = [];
            let tien_phat_nghi_khong_phep = 0;

            // lấy số ca có lịch làm việc mà không chấm công 
            for(let i = 0; i <data_circle.length; i++ ){
                let shift_id_check = data_circle[i].shift_id;
                let check = data_time_sheet.find((e)=>(
                    (e.at_time.getDate() ==  data_circle[i].date.getDate()) && (e.shift_id == shift_id_check)
                )
                );
                if(!check){
                    let check2 = data_ko_cc.find((e)=>e.shift_id == shift_id_check);
                    if(check2){
                        data_ko_cc = data_ko_cc.filter((e)=> e.shift_id != shift_id_check)
                        data_ko_cc.push({
                            shift_id: shift_id_check,
                            count:check2.count +1
                        })
                    }
                    else{
                        data_ko_cc.push({
                            shift_id: shift_id_check,
                            count:0
                        })
                    }
                }
            }

            let list_de_xuat_duyet = list_de_xuat_duyet_congty.filter((e)=> e.id_user == ep_id);
            if(list_de_xuat_duyet.length){
                for(let i = 0; i < list_de_xuat_duyet.length; i++){
                    let dexuat = list_de_xuat_duyet[i];
                    // đề xuất chưa được duyệt 
                    // if(dexuat.type_duyet == 6 && dexuat.nghi_phep){
                    //     let nd_nghi = dexuat.nghi_phep;
                    //     let bd_nghi = nd_nghi.bd_nghi;
                    //     let kt_nghi = nd_nghi.kt_nghi;
                    //     // lấy lịch làm việc trong những ngày nghỉ 
                    //     let data_circle_nghi = data_circle.filter((e)=> (e.date <= kt_nghi) && (e.date >= bd_nghi) );
                    //     // tính số ca nghỉ không phép khi đề xuất không được duyệt bằng cách check xem có lịch sử chấm công trong ca làm việc trong lịch làm việc không
                    //     for(let j=0; j<data_circle_nghi.length; j++){
                    //          let data_time_sheet_nghi = data_time_sheet.find((e)=>
                    //            (e.at_time.getDate() ==  data_circle_nghi[j].date.getDate()) && (e.shift_id == data_circle_nghi.shift_id)
                    //          );
                    //          if(!data_time_sheet_nghi){
                    //             so_ca_nghi_khong_phep = so_ca_nghi_khong_phep + 1;
                    //          }
                    //     } 
                    // }
                    // nếu đề xuất được duyệt 
                    if(dexuat.type_duyet == 5 && dexuat.noi_dung.nghi_phep){
                        let nd_nghi = dexuat.nghi_phep;
                        let bd_nghi = nd_nghi.bd_nghi;
                        let kt_nghi = nd_nghi.kt_nghi;
                        // lấy lịch làm việc trong những ngày xin phep 
                        let data_circle_nghi = data_circle.filter((e)=> (e.date <= kt_nghi) && (e.date >= bd_nghi) );
                        if(dexuat.noi_dung.nghi_phep.loai_np == 1){
                            so_ca_kcc_van_tinh_cong = data_circle_nghi.length;
                        }
                        // tính số ca nghỉ không phép khi đề xuất không được duyệt bằng cách check xem có lịch sử chấm công trong ca làm việc trong lịch làm việc không
                        for(let j=0; j<data_circle_nghi.length; j++){
                            let shift_id_check = data_circle_nghi[i].shift_id;
                            let data_time_sheet_nghi = data_time_sheet.find((e)=>
                            (e.at_time.getDate() ==  data_circle_nghi[j].date.getDate()) && (e.shift_id == data_circle_nghi.shift_id)
                            );
                            // không có dữ liệu chấm công 
                            if(!data_time_sheet_nghi){
                                let check2 = data_ko_cc_co_phep.find((e)=>e.shift_id == shift_id_check);
                                if(check2){
                                    data_ko_cc_co_phep = data_ko_cc.filter((e)=> e.shift_id != shift_id_check)
                                    data_ko_cc_co_phep.push({
                                        shift_id: shift_id_check,
                                        count:check2.count +1
                                    })
                                }
                                else{
                                    data_ko_cc_co_phep.push({
                                        shift_id: shift_id_check,
                                        count:0
                                    })
                                }
                            }
                        } 
                    }
                }
            }

            for(let i=0; i<data_ko_cc.length; i++){
                let co_phep_count = 0;
                let shift_id_check = data_ko_cc[i].shift_id;
                let co_phep = data_ko_cc_co_phep.find((e)=> e.shift_id == shift_id_check);
                if(co_phep){
                    co_phep_count = co_phep.count;
                };
                let k_phep = data_ko_cc - co_phep_count;
                let data_phat_nghi_ko_phep = await TinhluongPhatCa.find(
                    {
                        pc_type:1,
                        pc_time:{$lte:start_date},
                        pc_shift:shift_id_check
                    },
                    {   
                        pc_money: 1
                    }
                ).sort({pc_time:-1}).limit(1).lean();
                if(data_phat_nghi_ko_phep.length){
                    tien_phat_nghi_khong_phep = k_phep * data_phat_nghi_ko_phep[0].pc_money;
                }
            }

            //lấy phạt đi muộn về sớm
            let tien_phat_muon = 0;
            let cong_phat_muon = [];
            let data_late_early = list_data_late_early.filter((e)=> e.ep_id == ep_id);
            if(data_late_early.length){
                for(let i = 0; i < data_late_early.length; i++){
                    let obj = data_late_early[i];
                    let cong;
                    let tempt = Math.round((new Date(obj.check_out) - new Date(obj.check_in)) / 1000)
                    if(     (new Date(obj.check_out) > new Date('1970-01-01T00:00:00.000+00:00')) 
                        && (new Date(obj.check_in)) > new Date('1970-01-01T00:00:00.000+00:00')
                        && (tempt > 1800)
                    ){
                        cong = 1;
                    }
                    else{
                        cong = 0;
                    };
                    if(cong){
                        if(obj.early && obj.early_second){
                            let list_pm = await TinhluongPhatMuon.find(
                                {
                                    pm_id_com:cp,
                                    pm_type:2,
                                    pm_time_begin:{$gte:start_date},
                                    $or:[
                                        {pm_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
                                        {pm_time_end:{$lte:end_date}}
                                    ],
                                    pm_shift:obj.shift_id,
                                    pm_minute :{$lte:obj.early}
                                }
                            ).sort({pm_minute:-1}).limit(1).lean();
                            if(list_pm.length){
                                let pm_info = list_pm[0];
                                if(pm_info.pm_type_phat == 1){
                                    tien_phat_muon = tien_phat_muon + pm_info.pm_monney
                                }
                                else{
                                    cong_phat_muon.push({
                                        date:obj.ts_date,
                                        shift_id:shift_id,
                                        cong:pm_info.pm_monney,
                                        addition:obj
                                    })
                                }
                            }
                        }
                        if(obj.late && obj.late_second){
                            let list_pm = await TinhluongPhatMuon.find(
                                {
                                    pm_id_com:cp,
                                    pm_type:2,
                                    pm_time_begin:{$gte:start_date},
                                    $or:[
                                        {pm_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
                                        {pm_time_end:{$lte:end_date}}
                                    ],
                                    pm_shift:obj.shift_id,
                                    pm_minute :{$lte:obj.late}
                                }
                            ).sort({pm_minute:-1}).limit(1).lean();
                            if(list_pm.length){
                                let pm_info = list_pm[0];
                                if(pm_info.pm_type_phat == 1){
                                    tien_phat_muon = tien_phat_muon + pm_info.pm_monney
                                }
                                else{
                                    cong_phat_muon.push({
                                        date:obj.ts_date,
                                        shift_id:shift_id,
                                        cong:pm_info.pm_monney,
                                        addition:obj
                                    })
                                }
                            }
                        }
                    }
                }
            }

            // lấy công thực
            let luong_thuc = 0;
            let luong_sau_phat = 0;
            let cong_thuc = 0;
            let so_cong_phat_muon = 0;
            let count_real_works = list_count_real_works.filter((e)=> e.ep_id == ep_id)


            // lấy data lương 
            let list_data_salary = data_salary;

            // lấy từng đối tượng để sử lý trường hợp sửa lương giữa tháng 
            if(count_real_works.length && list_contract.length){
                for(let i = 0; i < count_real_works.length;i++){
                    cong_thuc = cong_thuc + count_real_works[i].num_to_calculate;
                    let cong_them = count_real_works[i].num_to_calculate;
                    let cong_data = count_real_works[i];
                    // công 1 ngày sau phạt muộn => có công mới phạt 
                    let list_cong_phat = cong_phat_muon.filter((e)=> ( e.date.getDate() == cong_data.ts_date.getDate() ));
                    for(let j = 0; j < list_cong_phat.length; j++){
                        if(list_cong_phat[j].cong){
                            cong_thuc = cong_thuc - list_cong_phat[j].cong;
                            cong_them = cong_them - list_cong_phat[j].cong;
                            so_cong_phat_muon = so_cong_phat_muon + list_cong_phat[j].cong;
                        }
                    }
                    // lấy hợp đồng 
                    let contract_info = list_contract.find((e)=>
                    (e.con_time_end.getDate() >= cong_data.ts_date.getDate())
                    && (e.con_time_up.getDate() <= cong_data.ts_date.getDate())
                    );
                    if(contract_info){
                        let phan_tram_hop_dong = Number(contract_info.con_salary_persent);
                        let data_luong = list_data_salary.find((e)=>
                        (e.sb_time_up <= cong_data.ts_date)
                        );
                        if(data_luong){
                            luong_thuc = luong_thuc + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * count_real_works[i].num_to_calculate ;
                            luong_sau_phat = luong_sau_phat + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * cong_them
                        }
                    }

                }
            }

            // lấy công ghi nhận thêm 
            let get_dx_cong_tl365 = list_get_dx_cong_tl365.filter((e)=> e.id_user == ep_id);
            let cong_xn_them = 0;
            for(let i=0; i<get_dx_cong_tl365.length; i++){
                let data_xnc = get_dx_cong_tl365[i];
                let shiftId = data_xnc.xac_nhan_cong.ca_xnc;
                if(shiftId){
                    let data_shift_xnc = await Shift.findOne({shift_id:Number(shiftId)},{num_to_calculate:1}).lean();
                    if(data_shift_xnc){
                        cong_xn_them = cong_xn_them + data_shift_xnc.num_to_calculate;
                        // cộng lương vào lương thực luôn 
                        let contract_info = list_contract.find((e)=>
                            (e.con_time_end.getDate() >= data_xnc.xac_nhan_cong.time_xnc.getDate())
                            && (e.con_time_up.getDate() <= data_xnc.xac_nhan_cong.time_xnc.getDate())
                        );
                        if(contract_info){
                            let phan_tram_hop_dong = Number(contract_info.con_salary_persent);
                            let data_luong = list_data_salary.find((e)=>
                            (e.sb_time_up <= data_xnc.xac_nhan_cong.time_xnc)
                            );
                            if(data_luong){
                                luong_thuc = luong_thuc + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * data_shift_xnc.num_to_calculate ;
                                luong_sau_phat = luong_sau_phat + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * data_shift_xnc.num_to_calculate ;
                            }
                        }
                    }
                }
            }

            //lấy nghỉ thưởng nghỉ lễ => Đang Không dùng 
            let luong_nghi_le = 0;

            // tiền tạm ứng => để sau 
            let tien_tam_ung = 0;
            //tiền phúc lợi 
            let tien_phuc_loi_thue = 0;
            let tien_phuc_loi = 0;
            let data_phuc_loi = list_data_phuc_loi.filter((e)=> e.cls_id_user == ep_id)
            if(data_phuc_loi.length){
                for(let i = 0; i < data_phuc_loi.length ; i++){
                    if(data_phuc_loi[i].TinhluongListClass.length){
                        tien_phuc_loi = tien_phuc_loi + Number(data_phuc_loi[i].TinhluongListClass[0].cl_salary)
                        if(data_phuc_loi[i].TinhluongListClass[0].cl_type_tax == 1){
                            tien_phuc_loi_thue = tien_phuc_loi_thue +  Number(data_phuc_loi[i].TinhluongListClass[0].cl_salary);
                        }
                    }
                }
            }

            //tiền phụ cấp
            let tien_phu_cap= 0;
            let tien_phu_cap_thue = 0; 
            let cong_max = 0;
            let ratio_check = 0;
            let data_phu_cap = list_data_phu_cap.filter((e)=> e.cls_id_user == ep_id)
            if(data_phu_cap.length){
                for(let i = 0; i < data_phu_cap.length; i++){
                    if(data_phu_cap[i].TinhluongListClass && data_phu_cap[i].TinhluongListClass.length){
                        let cong_pc = 0;
                        if(cong_max >= cong_chuan){
                            cong_pc = cong_chuan;
                            break;
                        }
                        for(let j = 0; j < count_real_works.length; j++){
                            if(data_phu_cap[i].TinhluongListClass.length){
                                let check_time = count_real_works[j].ts_date;
                                let flag = false; 
                                if(
                                    (check_time >= data_phu_cap[i].cls_day)
                                    && ( (check_time <= data_phu_cap[i].cls_day_end)
                                        || (data_phu_cap[i].cls_day_end == new Date('1970-01-01T00:00:00.000+00:00'))
                                    )
                                    && ( check_time >= data_phu_cap[i].TinhluongListClass[0].cl_day )
                                    && ( (check_time <= data_phu_cap[i].TinhluongListClass[0].cl_day_end) ||
                                        (data_phu_cap[i].TinhluongListClass[0].cl_day_end == new Date('1970-01-01T00:00:00.000+00:00'))
                                    )
                                ){
                                    cong_max = cong_max + count_real_works[j].num_to_calculate;
                                    if(cong_max >= cong_chuan){
                                        cong_pc = cong_chuan;
                                    }
                                };
                            }
                        };
                        if(ratio_check > 0){
                            let cong_check = (1-ratio_check) * cong_chuan;
                            if(cong_pc >= cong_check){
                                cong_pc = cong_check
                            }
                        }
                        let ratio = cong_pc / cong_chuan;
                        ratio_check = ratio_check + ratio;

                        if(ratio > 1){
                            ratio = 1;
                        }
                        else {
                            ratio = ratio.toFixed(3);
                        }
                        tien_phu_cap = tien_phu_cap + data_phu_cap[i].TinhluongListClass[0].cl_salary * ratio;
                        if(data_phu_cap[i].TinhluongListClass[0].cl_type_tax == 1){
                            tien_phu_cap_thue = tien_phu_cap_thue + data_phu_cap[i].TinhluongListClass[0].cl_salary * ratio;
                        }
                    }
                }
            }

            // tiền phụ cấp theo ca và phạt nghỉ không phép

            // tiền bảo hiểm 
            let tong_bao_hiem = 0;
            // $qr_list_insrc = new db_query("SELECT cls_id_user,cls_id_cl,fs_repica,max(`cls_day`) FROM `tb_class`
            //     INNER JOIN tb_list_class ON tb_class.cls_id_cl = tb_list_class.cl_id
            //     INNER JOIN tb_form_salary ON cl_id_form = fs_id
            //     WHERE cls_id_user = '" . $id . "' AND cls_id_com = '" . $cp . "' AND 
            //     tb_list_class.cl_type = '2' AND tb_class.cls_day <= '$end_date' AND (tb_class.cls_day_end IS NULL OR tb_class.cls_day_end >='$start_date') GROUP BY `cl_id` ");
            let data_bao_hiem_final = []
            let data_bao_hiem = list_data_bao_hiem.filter((e)=> e.cls_id_user == ep_id)
            for(let i = 0; i <data_bao_hiem.length; i++){
                if(data_bao_hiem[i].TinhluongListClass && data_bao_hiem[i].TinhluongListClass.length){
                    if(data_bao_hiem[i].TinhluongListClass[0].cl_id_form){
                        let data_form = await TinhluongFormSalary.findOne(
                            {fs_id:data_bao_hiem[i].TinhluongListClass[0].cl_id_form},
                            {fs_repica:1}
                        ).lean();
                        if(data_form){
                            data_bao_hiem_final.push({
                                cls_id_user:data_bao_hiem[i].cls_id_user,
                                cls_id_cl:data_bao_hiem[i].cls_id_cl,
                                cls_day:data_bao_hiem[i].cls_day,
                                cls_day_end:data_bao_hiem[i].cls_day_end,
                                fs_repica:data_form.fs_repica
                            });
                        }
                    }
                }
            }
            // for(let i=0; i < data_bao_hiem_final.length ; i++){
            // }

            // lấy các loại tiền khác

            // hoa hồng cá nhân của nhân viên
            let hoa_hong_ca_nhan = list_hoa_hong_ca_nhan.filter((e)=> e.ro_id_user == ep_id);
            let tong_hoa_hong = 0;
            let hoa_hong_1 = 0;
            let hoa_hong_2 = 0;
            let hoa_hong_3 = 0;
            let hoa_hong_4 = 0;
            let hoa_hong_5 = 0;
            for(let i = 0; i <hoa_hong_ca_nhan.length ; i++){
                let hh_data = hoa_hong_ca_nhan[i];
                if(hh_data.TinhluongThietLap){
                    let ro_time = hh_data.ro_time;
                    let ro_price = hh_data.ro_price;
                    let ro_so_luong = hh_data.ro_so_luong;
                    let ro_id_user = hh_data.ro_id_user;
                    let ro_id_lr = hh_data.ro_id_lr;
                    let ro_note = hh_data.ro_note;
                    let ro_kpi_active = hh_data.ro_kpi_active;
                    let tl_hoahong = hh_data.TinhluongThietLap.tl_hoahong;
                    let tl_chiphi = hh_data.TinhluongThietLap.tl_chiphi;
                    let tl_kpi_yes = hh_data.TinhluongThietLap.tl_kpi_yes;
                    let tl_kpi_no = hh_data.TinhluongThietLap.tl_kpi_no;
                    let tl_phan_tram = hh_data.TinhluongThietLap.tl_phan_tram;
                    let tl_money_min = hh_data.TinhluongThietLap.tl_money_min;
                    let tl_money_max = hh_data.TinhluongThietLap.tl_money_max;
                    if(ro_id_lr == 1){
                        tong_hoa_hong = tong_hoa_hong + ro_price;
                        hoa_hong_1 = hoa_hong_1 + ro_price;
                    };
                    if(ro_id_lr == 2){
                        if(
                            (ro_price >= tl_money_min)
                            && (ro_price >= tl_money_max)
                        ){
                            tong_hoa_hong = tong_hoa_hong + ro_price*tl_phan_tram /100;
                            hoa_hong_2 = hoa_hong_2 + ro_price*tl_phan_tram /100;
                        }
                    }
                    if(ro_id_lr == 3){
                        tong_hoa_hong = tong_hoa_hong + ro_price - (tl_chiphi * ro_so_luong );
                        hoa_hong_3 = hoa_hong_3 + ro_price - (tl_chiphi * ro_so_luong );
                    }
                    if(ro_id_lr == 4){
                        tong_hoa_hong = tong_hoa_hong + tl_hoahong * ro_so_luong ;
                        hoa_hong_4 = hoa_hong_4 + tl_hoahong * ro_so_luong;
                    }
                    if(ro_id_lr == 5){
                        if(ro_kpi_active == 1){
                            tong_hoa_hong = tong_hoa_hong + tl_kpi_yes ;
                            hoa_hong_5 = hoa_hong_5 + tl_kpi_yes;
                        }
                        else{
                            tong_hoa_hong = tong_hoa_hong + tl_kpi_no ;
                            hoa_hong_5 = hoa_hong_5 + tl_kpi_no;
                        }
                    }
                }

            }

            // hoa hồng nhóm của nhân viên
            let hoa_hong_nhom = list_hoa_hong_nhom;
            for(let i = 0; i <hoa_hong_nhom.length; i++) {
                let hh_data = hoa_hong_nhom[i];
                if(hh_data.TinhluongThietLap){
                    let ro_id = hh_data.ro_id;
                    let ro_time = hh_data.ro_time;
                    let ro_price = hh_data.ro_price;
                    let ro_so_luong = hh_data.ro_so_luong;
                    let ro_id_lr = hh_data.ro_id_lr;
                    let ro_note = hh_data.ro_note;
                    let ro_kpi_active = hh_data.ro_kpi_active;
                    let tl_hoahong = hh_data.TinhluongThietLap.tl_hoahong;
                    let tl_chiphi = hh_data.TinhluongThietLap.tl_chiphi;
                    let tl_kpi_yes = hh_data.TinhluongThietLap.tl_kpi_yes;
                    let tl_kpi_no = hh_data.TinhluongThietLap.tl_kpi_no;
                    let tl_phan_tram = hh_data.TinhluongThietLap.tl_phan_tram;
                    let tl_money_min = hh_data.TinhluongThietLap.tl_money_min;
                    let tl_money_max = hh_data.TinhluongThietLap.tl_money_max;
                    let g_user = await TinhluongPercentGr.findOne(
                        {
                        pr_rose:ro_id,
                        pr_id_user:ep_id,
                        pr_percent:{$ne:0}
                        },
                        {
                            pr_percent: 1
                        }
                    ).lean();
                    if(g_user){
                        let pr_percent = g_user.pr_percent;
                        pr_percent = pr_percent / 100;
                        if(ro_id_lr == 1){
                            tong_hoa_hong = tong_hoa_hong + ro_price;
                            hoa_hong_1 = hoa_hong_1 + ro_price;
                        };
                        if(ro_id_lr == 2){
                            if(
                                (ro_price >= tl_money_min)
                                && (ro_price >= tl_money_max)
                            ){
                                tong_hoa_hong = tong_hoa_hong + ro_price*tl_phan_tram /100*pr_percent;
                                hoa_hong_2 = hoa_hong_2 + ro_price*tl_phan_tram /100*pr_percent;
                            }
                        }
                        if(ro_id_lr == 3){
                            tong_hoa_hong = tong_hoa_hong + ro_price - (tl_chiphi * ro_so_luong *pr_percent );
                            hoa_hong_3 = hoa_hong_3 + ro_price - (tl_chiphi * ro_so_luong *pr_percent);
                        }
                        if(ro_id_lr == 4){
                            tong_hoa_hong = tong_hoa_hong + tl_hoahong * ro_so_luong *pr_percent ;
                            hoa_hong_4 = hoa_hong_4 + tl_hoahong * ro_so_luong *pr_percent;
                        }
                        if(ro_id_lr == 5){
                            if(ro_kpi_active == 1){
                                tong_hoa_hong = tong_hoa_hong + tl_kpi_yes*pr_percent ;
                                hoa_hong_5 = hoa_hong_5 + tl_kpi_yes*pr_percent;
                            }
                            else{
                                tong_hoa_hong = tong_hoa_hong + tl_kpi_no*pr_percent ;
                                hoa_hong_5 = hoa_hong_5 + tl_kpi_no*pr_percent;
                            }
                        }
                    }
                }
            }

            // tính thuế
            // $tong_luong = $luong_sau_phat + $luong_nghi_le + $tong_hoa_hong - $tien_tam_ung - $tien_phat_muon 
            //+ $thuong - $phat - $phat_nghi_khong_phep - $tien_phat_nghi + $tien_phuc_loi + 
            //$tien_phu_cap + $tien_phu_cap_theo_ca - $tong_bao_hiem + $tien_khac + $nghi_co_luong + $cong_tien;

            // tiền phạt muộn có 2 loại 
            // - loại phạt tiền nằm trong tien_phat_muon
            // - lọai phạt công đã được trừ trong lúc tổng hợp lương thực 
            let tong_luong = luong_sau_phat + luong_nghi_le + tong_hoa_hong - tien_tam_ung - tien_phat_muon + thuong - phat - tien_phat_nghi_khong_phep + tien_phuc_loi + tien_phu_cap - tong_bao_hiem

            // lương đã trả
            let luong_da_tra = 0;
            listResult.push({
                ep_id,
                tong_luong,
                luong_thuc,
                luong_sau_phat,
                luong_nghi_le,
                luong_da_tra,
                tong_hoa_hong,
                tien_phat_muon,
                tien_phat_nghi_khong_phep,
                thuong,
                phat,
                tien_phuc_loi,
                tien_phu_cap,
                tong_bao_hiem,
                so_cong_phat_muon
            })
        }
        return res.status(200).json({ data: true, message: "success",listResult,listUser,Count:listUser.length});
    }catch (error) {
        console.error("controller/tinhluong/congty show_bangluong_nv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// cài đặt 
// cài đặt nhóm làm việc 
// TinhluongGroup : lưu thông tin của nhân viên ứng với từng nhóm 
// TinhluongListGroup : lưu danh sách các nhóm 
exports.insert_group = async (req, res) => {
    try{
        const lgr_id_com = Number(req.body.lgr_id_com);
        const lgr_name = String(req.body.lgr_name);
        const lgr_note = String(req.body.lgr_note);

        let data_counter = await Counter.findOne({TableId:'TinhluongListGroupId'});
        if(data_counter){
            let lgr_id = data_counter.Count + 1;
            let obj = new TinhluongListGroup(
                { 
                  lgr_id,
                  lgr_id_com,
                  lgr_name,
                  lgr_note
                }
            )
            let newobj = await obj.save();
            return res.status(200).json({ data: true, message: "success",newobj});
        }

    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_payment", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.takedata_group_com = async (req, res) => {
    try{
        const lgr_id_com = Number(req.body.lgr_id_com);
        let listGroup = await TinhluongListGroup.find({lgr_id_com}).lean();
        return res.status(200).json({ data: true, message: "success",listGroup});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_payment", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.update_group_com = async (req, res) => {
    try{
        const lgr_name = String(req.body.lgr_name);
        const lgr_note = String(req.body.lgr_note);
        const lgr_id = Number(req.body.lgr_id);
        let listGroup = await TinhluongListGroup.updateOne(
            {lgr_id},
            {
                $set:{
                    lgr_name,
                    lgr_note
                }
            },{returnDocument: 'after'}
        ).lean();
        return res.status(200).json({ data: true, message: "success",listGroup});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_payment", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.delete_group_com = async (req, res) => {
    try{
        const lgr_id = Number(req.body.lgr_id);
        await TinhluongListGroup.deleteOne({lgr_id});
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty delete_group_com", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.add_people_group = async (req, res) => {
    try{
        const gm_id_group = Number(req.body.gm_id_group);
        const gm_id_user = Number(req.body.gm_id_user);
        const gm_id_com = Number(req.body.gm_id_com);
        let data_counter = await Counter.findOne({TableId:'TinhluongGroupId'});
        let gm_id = data_counter.Count + 1;
            let obj = new TinhluongGroup(
                { 
                  gm_id,
                  gm_id_group,
                  gm_id_user,
                  gm_id_com
                }
            )
        let newobj = await obj.save();
        return res.status(200).json({ data: true, message: "success",newobj});
    }catch (error) {
        console.error("controller/tinhluong/congty add_people_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.take_member_many_group = async (req, res) => {
    try{
        let listGroup = JSON.parse(req.body.listGroup);
        let listGroupFinal = [];
        for(let i =0; i<listGroup.length; i++){
            listGroupFinal.push(listGroup[i]);
        }
        let listUser = await TinhluongGroup.find(
            {
                gm_id_group:{$in:listGroupFinal}
            },
            {
                gm_id_user:1
            }
        );
        let listUserId = [];
        for(let i = 0; i < listUser.length; i++){
            listUserId.push(Number(listUser[i].gm_id_user))
        };
        let listUserFinal = await User.find({idQLC:{$in:listUserId}},{password:0}).lean()
        return res.status(200).json({ data: true, message: "success",listUserFinal});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
// danh sách nhân viên có nhóm và chưa có nhóm 
exports.takeinfo_member_group_com = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        let listEmInCom = await User.find(
            {
                "inForPerson.employee.com_id":com_id
            }
        );
        let listGroupFinal = [];
        let listGroup = await TinhluongListGroup.find({lgr_id_com:com_id},{lgr_id:1}).lean();
        for(let i =0; i<listGroup.length; i++){
            listGroupFinal.push(listGroup[i]);
        };
        let listUserGroup = await TinhluongGroup.find(
            {
                gm_id_group:{$in:listGroupFinal}
            }
        ).lean();
        let listUserNoGroup = listEmInCom.filter((e)=> !listUserGroup.find((a)=> a.gm_id_user == e.idQLC) )
        let listUserGroupDetail = listEmInCom.filter((e)=> listUserGroup.find((a)=> a.gm_id_user == e.idQLC) );
        return res.status(200).json({ data: true, message: "success",listUserNoGroup,listUserGroupDetail,listUserGroup});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_member_group_com", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// cài đặt đi muộn về sớm 
exports.insert_phat_muon = async (req, res) => {
    try{
        const pm_type = Number(req.body.pm_type);
        const pm_shift = Number(req.body.pm_shift);
        const pm_type_phat = Number(req.body.pm_type_phat);
        const pm_time_begin = new Date(req.body.pm_time_begin);
        const pm_time_end = new Date(req.body.pm_time_end);
        const pm_monney = Number(req.body.pm_monney);
        const pm_minute = Number(req.body.pm_minute);
        const pm_id_com = Number(req.body.pm_id_com);
       
        //TinhluongPhatMuon
        let data_counter = await Counter.findOne({TableId:'TinhluongPhatMuonId'});
        let pm_id = data_counter.Count + 1;
            let obj = new TinhluongPhatMuon(
                { 
                    pm_id,
                    pm_type,
                    pm_shift,
                    pm_type_phat,
                    pm_time_begin,
                    pm_time_end,
                    pm_monney,
                    pm_minute,
                    pm_id_com
                }
            )
        let newobj = await obj.save();
        
        return res.status(200).json({ data: true, message: "success",newobj});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.delete_phat_muon = async (req, res) => {
    try{
        const pm_id = Number(req.body.pm_id);
        await TinhluongPhatMuon.deleteOne({pm_id})
        
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.update_phat_muon = async (req, res) => {
    try{
        const pm_type = Number(req.body.pm_type);
        const pm_shift = Number(req.body.pm_shift);
        const pm_type_phat = Number(req.body.pm_type_phat);
        const pm_time_begin = new Date(req.body.pm_time_begin);
        const pm_time_end = new Date(req.body.pm_time_end);
        const pm_monney = Number(req.body.pm_monney);
        const pm_minute = Number(req.body.pm_minute);
        const pm_id_com = Number(req.body.pm_id_com);
        const pm_id = Number(req.body.pm_id);
        //TinhluongPhatMuon
        await TinhluongPhatMuon.updateOne({
            pm_id
        },{
            $set:{
                pm_type,
                pm_shift,
                pm_type_phat,
                pm_time_begin,
                pm_time_end,
                pm_monney,
                pm_minute,
                pm_id_com
            }
        })
        
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.takeinfo_phat_muon = async (req, res) => {
    try{
        const pm_time_begin = new Date(req.body.pm_time_begin);
        const pm_time_end = new Date(req.body.pm_time_end);
        const pm_id_com = Number(req.body.pm_id_com);
        let phat_muon_info = await TinhluongPhatMuon.find({
            pm_id_com:pm_id_com,
            pm_time_begin:{$lte:pm_time_begin},
            $or:[
                {pm_time_end:{$gte:pm_time_end}},
                {pm_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
            ]
        })
        
        return res.status(200).json({ data: true, message: "success",phat_muon_info});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


exports.show_staff_late = async (req, res) => {
    try{
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        const com_id = Number(req.body.com_id);
        let array = [];
        let listUser = await User.find(
            {"inForPerson.employee.com_id":com_id},
            {idQLC:1}
        ).lean();
        for(let i = 0; i < listUser.length; i++){
            array.push(Number(listUser[i].idQLC))
        }
        let list_data_late_early = await NhanVienService.get_list_timekeeping_late_early_by_company(array,com_id,start_date,end_date);
        let listUserId = [];
        for(let i=0; i < list_data_late_early.length; i++){
            listUserId.push(list_data_late_early[i].ep_id);
        };
        let listUserDetail = await User.find(
            {idQLC:{$in:listUserId},type:{$ne:1}},
            {
                password:0,
                configChat:0,
                "inForPerson.employee.ep_featured_recognition":0
            }
        ).lean();
        let tien_phat_muon = [];
        let cong_phat_muon = [];
        if(list_data_late_early.length){
            for(let i = 0; i < list_data_late_early.length; i++){
                let obj = list_data_late_early[i];
                let cong;
                let tempt = Math.round((new Date(obj.check_out) - new Date(obj.check_in)) / 1000)
                if(     (new Date(obj.check_out) > new Date('1970-01-01T00:00:00.000+00:00')) 
                     && (new Date(obj.check_in)) > new Date('1970-01-01T00:00:00.000+00:00')
                     && (tempt > 1800)
                ){
                    cong = 1;
                }
                else{
                    cong = 0;
                };
                if(cong){
                    if(obj.early && obj.early_second){
                        let list_pm = await TinhluongPhatMuon.find(
                            {
                                pm_id_com:com_id,
                                pm_type:2,
                                pm_time_begin:{$lte:start_date},
                                pm_shift:obj.shift_id,
                                pm_minute :{$lte:obj.early}
                            }
                        ).sort({pm_minute:-1}).limit(1).lean();
                        if(list_pm.length){
                            list_pm = list_pm.filter((e)=> (e.pm_time_end == null)|| (e.pm_time_end < end_date) || (e.pm_time_end == new Date('1970-01-01T00:00:00.000+00:00')))
                            let pm_info = list_pm[0];
                            if(pm_info.pm_type_phat == 1){
                                // tien_phat_muon = tien_phat_muon + pm_info.pm_monney
                                tien_phat_muon.push({
                                    sheet_id:obj.sheet_id,
                                    date:obj.ts_date,
                                    shift_id:obj.shift_id,
                                    cong:pm_info.pm_monney,
                                    addition:obj
                                })
                            }
                            else{
                                cong_phat_muon.push({
                                     sheet_id:obj.sheet_id,
                                     date:obj.ts_date,
                                     shift_id:obj.shift_id,
                                     cong:pm_info.pm_monney,
                                     addition:obj
                                })
                            }
                        }
                    }
                    if(obj.late && obj.late_second){
                        let list_pm = await TinhluongPhatMuon.find(
                            {
                                pm_id_com:com_id,
                                pm_type:2,
                                pm_time_begin:{$lte:start_date},
                                pm_shift:obj.shift_id,
                                pm_minute :{$lte:obj.late}
                            }
                        ).sort({pm_minute:-1}).limit(1).lean();
                        if(list_pm.length){
                            list_pm = list_pm.filter((e)=> (e.pm_time_end == null)|| (e.pm_time_end < end_date) || (e.pm_time_end == new Date('1970-01-01T00:00:00.000+00:00')));
                            let pm_info = list_pm[0];
                            if(pm_info.pm_type_phat == 1){
                                // tien_phat_muon = tien_phat_muon + pm_info.pm_monney
                                tien_phat_muon.push({
                                    sheet_id:obj.sheet_id,
                                    date:obj.ts_date,
                                    shift_id:obj.shift_id,
                                    cong:pm_info.pm_monney,
                                    addition:obj
                                })
                            }
                            else{
                                cong_phat_muon.push({
                                     sheet_id:obj.sheet_id,
                                     date:obj.ts_date,
                                     shift_id:obj.shift_id,
                                     cong:pm_info.pm_monney,
                                     addition:obj
                                })
                            }
                        }
                    }
                }
            }
        }
        return res.status(200).json({ data: {
            list_data_late_early,
            listUserDetail,
            tien_phat_muon,
            cong_phat_muon
        }, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// cài đặt nghỉ phép 

// list_phat_nghi
// lấy danh sách hiển thị ở đầu tiên 
exports.takeinfo_phat_ca_com = async (req, res) => {
    try{
        const pc_com = Number(req.body.pc_com);
        let listPhatCa = await TinhluongPhatCa.aggregate([
            {
                $match:{pc_com:pc_com}
            },
            {
                
                    $lookup:{
                        from: 'shifts', 
                        localField: 'pc_shift', 
                        foreignField: 'shift_id', 
                        as: 'shifts'
                    }
                
            }
        ]
        )
        
        return res.status(200).json({ data: true, message: "success",listPhatCa});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_phat_ca_com", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
// /ajax/edit_phat_nghi.php
exports.update_phat_ca = async (req, res) => {
    try{
        const pc_money = Number(req.body.pc_money);
        const pc_shift = Number(req.body.pc_shift);
        const pc_time =  new Date(req.body.pc_time);
        const pc_type = Number(req.body.pc_type);
        const pc_id = Number(req.body.pc_id)
        //TinhluongPhatMuon
        await TinhluongPhatCa.updateOne({
            pc_id
        },{
            $set:{
                pc_money,
                pc_shift,
                pc_time,
                pc_type
            }
        })
        
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
// /ajax/delete_phat_nghi.php
exports.delete_phat_ca = async (req, res) => {
    try{
        const pc_id = Number(req.body.pc_id)
        //TinhluongPhatMuon
        await TinhluongPhatCa.deleteOne({pc_id})
        
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.insert_phat_ca = async (req, res) => {
    try{
        const pc_com = Number(req.body.pc_com);
        const pc_shift = Number(req.body.pc_shift);
        const pc_money = Number(req.body.pc_money);
        const pc_time = new Date(req.body.pc_time);
        const pc_type = Number(req.body.pc_type);
        let data_counter = await Counter.findOne({TableId:'TinhluongPhatCaId'});
        let pc_id = data_counter.Count + 1;
        let obj = new TinhluongPhatCa(
            { 
                pc_id,
                pc_com,
                pc_shift,
                pc_money,
                pc_time,
                pc_type
            }
        )
        let newobj = await obj.save();
        
        return res.status(200).json({ data: true, message: "success", newobj});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.lay_thong_tin_nghi_phep = async (req, res) => {
    try{
        const pc_com = Number(req.body.pc_com);
        let list_np = await TinhluongListNghiPhep.find({});
        let group_one = await TinhluongListGroup.find({
            lgr_id_com:pc_com
        })
        
        return res.status(200).json({ data: true, message: "success",list_np,group_one});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_phat_ca_com", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lấy dữ liệu đề xuất 
exports.lay_de_xuat_congty = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        const start_date = new Date(req.body.start_date);
        const end_date = new Date(req.body.end_date);
        let array = [];
        let listUser = await User.find(
            {"inForPerson.employee.com_id":com_id},
            {idQLC:1}
        ).lean();
        for(let i = 0; i < listUser.length; i++){
            array.push(Number(listUser[i].idQLC))
        }
        let list_de_xuat_duyet_congty = await NhanVienService.get_de_xuat_tl365_congty(array,com_id,start_date,end_date);
        
        return res.status(200).json({ data: true, message: "success",list_de_xuat_duyet_congty});
    }catch (error) {
        console.error("controller/tinhluong/congty lay_de_xuat_congty", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// quan-ly-nghi-phep
exports.quan_ly_nghi_phep = async (req, res) => {
    try{
        const pc_com = Number(req.body.pc_com);
        let qd_lp = await TinhluongPhatCa.find({
            pc_type:2,
            pc_com:pc_com
        }) 
        return res.status(200).json({ data: true, message: "success",qd_lp});
    }catch (error) {
        console.error("controller/tinhluong/congty quan_ly_nghi_phep", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// lây danh sách loại phạt ca nghỉ không phép của 1 công ty 
exports.take_list_phat_nghi_ko_phep_com = async (req, res) => {
    try{
        const pc_com = Number(req.body.pc_com);
        let qd_lp = await TinhluongPhatCa.find({
            pc_type:1,
            pc_com:pc_com
        }) 
        return res.status(200).json({ data: true, message: "success",qd_lp});
    }catch (error) {
        console.error("controller/tinhluong/congty quan_ly_nghi_phep", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// /ajax/list_take.php
// lấy dữ liệu phạt muộn
exports.list_take = async (req, res) => {
    try{
        const pm_id_group = Number(req.body.pm_id_group);
        let list_all = await TinhluongPhatMuon.find(
            {pm_id_group}
        ).sort({pm_time_first:1}).lean();
        return res.status(200).json({ data: true, message: "success",list_all});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_phat_ca_com", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// /render/edit_phat_nghi.php
// lấy dữ liệu để edit 
exports.takedata_to_edit_phat_nghi = async (req, res) => {
    try{
        const fr_id = Number(req.body.fr_id);
        let tt = await TinhluongForm.find(
            {fr_id}
        ).lean();
        return res.status(200).json({ data: true, message: "success",tt});
    }catch (error) {
        console.error("controller/tinhluong/congty takedata_to_edit_phat_nghi", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
// /ajax/save_pn.php
// cập nhật phạt 
exports.save_pn = async (req, res) => {
    try{
        const fr_phat = Number(req.body.fr_phat);
        const fr_id = Number(req.body.fr_id);
        await TinhluongForm.updateOne(
            {fr_id},
            {fr_phat}
        );
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_phat_ca_com", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.edit_phat_ca = async (req, res) => {
    try{
        const pc_id = Number(req.body.pc_id);
        const pc_money = Number(req.body.pc_money);
        await TinhluongPhatCa.updateOne(
            {pc_id},
            {pc_money}
        );
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty takeinfo_phat_ca_com", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// hợp đồng 
exports.insert_contract = async (req, res) => {
    try{
        const con_id_user = Number(req.body.con_id_user);
        const con_name = String(req.body.con_name);
        const con_time_up = new Date(req.body.con_time_up);
        const con_time_end = new Date(req.body.con_time_end);
        const con_file = String(req.body.con_file);
        const con_salary_persent = Number(req.body.con_salary_persent)
        let data_counter = await Counter.findOne({TableId:'Tinhluong365ContractId'});
        let con_id = data_counter.Count + 1;
        let obj = new Tinhluong365Contract(
            { 
                con_id,
                con_id_user,
                con_name,
                con_time_up,
                con_time_end,
                con_file,
                con_salary_persent
            }
        )
        let newobj = await obj.save();
        
        return res.status(200).json({ data: true, message: "success", newobj});
    }catch (error) {
        console.error("controller/tinhluong/congty take_member_many_group", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.delete_contract = async (req, res) => {
    try{
        console.log("delete_contract");
        const con_id = Number(req.body.con_id);

        await Tinhluong365Contract.deleteOne({con_id})
        
        return res.status(200).json({ data: true, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty delete_contract", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

exports.edit_contract = async (req, res) => {
    try{
        //console.log("user is authorized",req.user);
        const con_id = Number(req.body.con_id);
        const con_name = String(req.body.con_name);
        const con_time_up = new Date(req.body.con_time_up);
        const con_time_end = new Date(req.body.con_time_end);
        const con_file = String(req.body.con_file);
        const con_salary_persent = Number(req.body.con_salary_persent);

        await Tinhluong365Contract.updateOne({con_id},{
            $set:{
                con_name,
                con_time_up,
                con_time_end,
                con_file,
                con_salary_persent
            }
        })
        
        return res.status(200).json({ 
             data: {
                newobj:await Tinhluong365Contract.findOne({con_id}).lean()
             },
             message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty edit_contract", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


exports.take_listuser_nghi_khong_phep = async (req, res) => {
    try{
        let com_id = Number(req.body.com_id);
        const cp = com_id;
        const dep_id = Number(req.body.dep_id) || 0;
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date);
        const month = Number(req.body.month);
        const year = Number(req.body.year);
        const limit = 10;
        const skip = Number(req.body.skip);
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));
        let listResult = [];
        let condition = {"inForPerson.employee.com_id":com_id,type:2};
        if(dep_id){
            condition = {"inForPerson.employee.com_id":com_id, "inForPerson.employee.dep_id":dep_id,type:2 }
        }
        let listUser = await User.find(
            condition,
            {
                password:0
            }
        ).sort({_id:-1}).lean();
        let array = [];
        for(let i = 0; i < listUser.length; i++) {
            array.push(listUser[i].idQLC)
        };

        let list_data_time_sheet = await CC365_TimeSheet.find(
            {
                ep_id:{$in:array},
                $and:[
                    {
                        at_time:{$gte:start_date}
                    },
                    {
                        at_time:{$lte:end_date}
                    }
                ]
            },
            {
                shift_id:1,
                at_time:1,
                ep_id:1
            }
        ).lean(); 
        
        let list_de_xuat_duyet_congty = await NhanVienService.get_de_xuat_tl365_congty(array,cp,start_date,end_date);

        // lịch làm việc 
        let list_data_circle = await NhanVienService.get_circle_listem(array,cp,new Date(req.body.start_date),new Date(req.body.end_date));
        let list_shilft = [];
        for(let i = 0; i < list_data_circle.length; i++){
            list_shilft.push(list_data_circle[i].shift_id);
        };
        let data_phat_nghi_ko_phep = await TinhluongPhatCa.find(
            {
                pc_type:1,
                pc_time:{$lte:start_date},
                pc_shift:{$in:list_shilft}
            },
            {   
                pc_shift:1,
                pc_money: 1
            }
        ).sort({pc_time:-1}).lean();
        for(let q=0; q < array.length ; q++){
            let ep_id = array[q];

            // lấy lịch làm việc của tháng đó 
            let data_circle = list_data_circle.filter((e)=> e.ep_id == ep_id);
            // lấy dữ liệu chấm công 
            let data_time_sheet = list_data_time_sheet.filter((e)=> e.ep_id == ep_id);


            //phạt nghỉ k đúng quy định
            //có lịch mà không chắm công 
            //không chấm công không phép 
            let data_ko_cc = [];
            let data_ko_cc_co_phep = [];
            let tien_phat_nghi_khong_phep = 0;

            // lấy số ca có lịch làm việc mà không chấm công 
            for(let i = 0; i <data_circle.length; i++ ){
                let shift_id_check = data_circle[i].shift_id;
                let check = data_time_sheet.find((e)=>(
                    (e.at_time.getDate() ==  data_circle[i].date.getDate()) && (e.shift_id == shift_id_check)
                    &&(e.at_time.getMonth() == data_circle[i].date.getMonth())
                )
                );
                if(!check){
                    let check2 = data_ko_cc.find((e)=>e.shift_id == shift_id_check);
                    if(check2){
                        data_ko_cc = data_ko_cc.filter((e)=> e.shift_id != shift_id_check)
                        data_ko_cc.push({
                            ep_id,
                            shift_id: shift_id_check,
                            time:data_circle[i].date,
                            count:check2.count +1
                        })
                    }
                    else{
                        data_ko_cc.push({
                            ep_id,
                            shift_id: shift_id_check,
                            time:data_circle[i].date,
                            count:0
                        })
                    }
                }
            }

            let list_de_xuat_duyet = list_de_xuat_duyet_congty.filter((e)=> e.id_user == ep_id);
            if(list_de_xuat_duyet.length){
                for(let i = 0; i < list_de_xuat_duyet.length; i++){
                    let dexuat = list_de_xuat_duyet[i];
                    // đề xuất chưa được duyệt 
                    // if(dexuat.type_duyet == 6 && dexuat.nghi_phep){
                    //     let nd_nghi = dexuat.nghi_phep;
                    //     let bd_nghi = nd_nghi.bd_nghi;
                    //     let kt_nghi = nd_nghi.kt_nghi;
                    //     // lấy lịch làm việc trong những ngày nghỉ 
                    //     let data_circle_nghi = data_circle.filter((e)=> (e.date <= kt_nghi) && (e.date >= bd_nghi) );
                    //     // tính số ca nghỉ không phép khi đề xuất không được duyệt bằng cách check xem có lịch sử chấm công trong ca làm việc trong lịch làm việc không
                    //     for(let j=0; j<data_circle_nghi.length; j++){
                    //          let data_time_sheet_nghi = data_time_sheet.find((e)=>
                    //            (e.at_time.getDate() ==  data_circle_nghi[j].date.getDate()) && (e.shift_id == data_circle_nghi.shift_id)
                    //          );
                    //          if(!data_time_sheet_nghi){
                    //             so_ca_nghi_khong_phep = so_ca_nghi_khong_phep + 1;
                    //          }
                    //     } 
                    // }
                    // nếu đề xuất được duyệt 
                    if(dexuat.type_duyet == 5 && dexuat.noi_dung.nghi_phep){
                        let nd_nghi = dexuat.nghi_phep;
                        let bd_nghi = nd_nghi.bd_nghi;
                        let kt_nghi = nd_nghi.kt_nghi;
                        // lấy lịch làm việc trong những ngày xin phep 
                        let data_circle_nghi = data_circle.filter((e)=> (e.date <= kt_nghi) && (e.date >= bd_nghi) );
                        if(dexuat.noi_dung.nghi_phep.loai_np == 1){
                            so_ca_kcc_van_tinh_cong = data_circle_nghi.length;
                        }
                        // tính số ca nghỉ không phép khi đề xuất không được duyệt bằng cách check xem có lịch sử chấm công trong ca làm việc trong lịch làm việc không
                        for(let j=0; j<data_circle_nghi.length; j++){
                            let shift_id_check = data_circle_nghi[i].shift_id;
                            let data_time_sheet_nghi = data_time_sheet.find((e)=>
                            (e.at_time.getDate() ==  data_circle_nghi[j].date.getDate()) && (e.shift_id == data_circle_nghi.shift_id)
                            );
                            // không có dữ liệu chấm công 
                            if(!data_time_sheet_nghi){
                                let check2 = data_ko_cc_co_phep.find((e)=>e.shift_id == shift_id_check);
                                if(check2){
                                    data_ko_cc_co_phep = data_ko_cc.filter((e)=> e.shift_id != shift_id_check)
                                    data_ko_cc_co_phep.push({
                                        ep_id,
                                        shift_id: shift_id_check,
                                        count:check2.count +1
                                    })
                                }
                                else{
                                    data_ko_cc_co_phep.push({
                                        ep_id,
                                        shift_id: shift_id_check,
                                        count:0
                                    })
                                }
                            }
                        } 
                    }
                }
            }
            let list_data_phat = [];
            
            for(let i=0; i<data_ko_cc.length; i++){
                list_data_phat.push(data_ko_cc[i].shift_id)
                // let co_phep_count = 0;
                // let shift_id_check = data_ko_cc[i].shift_id;
                // let co_phep = data_ko_cc_co_phep.find((e)=> e.shift_id == shift_id_check);
                // if(co_phep){
                //     co_phep_count = co_phep.count;
                // };
                // let k_phep = data_ko_cc - co_phep_count;
                // let data_phat_nghi_ko_phep = await TinhluongPhatCa.find(
                //     {
                //         pc_type:1,
                //         pc_time:{$lte:start_date},
                //         pc_shift:shift_id_check
                //     },
                //     {   
                //         pc_money: 1
                //     }
                // ).sort({pc_time:-1}).limit(1).lean();
                // if(data_phat_nghi_ko_phep.length){
                //     tien_phat_nghi_khong_phep = k_phep * data_phat_nghi_ko_phep[0].pc_money;
                // }
            }

            let data_ko_cc_final = [];
            for(let i =0; i < data_ko_cc.length; i++){
                data_ko_cc_final.push({
                    ep_id,
                    shift_id: data_ko_cc[i].shift_id,
                    time:data_ko_cc[i].time,
                    count:0,
                    money:data_phat_nghi_ko_phep.find((e)=> e.pc_shift == data_ko_cc[i].shift_id),
                    data_phat_nghi_ko_phep,
                    detail:listUser.find((e)=> e.idQLC == ep_id)
                })
            }
            if(data_ko_cc_final.length){
                listResult.push({
                    ep_id:ep_id,
                    data_ko_cc_final,
                    data_ko_cc_co_phep
                })
            }
        }
        return res.status(200).json({ 
             data: listResult,
             message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty edit_contract", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}


// danh sách nhân viên cộng công 
exports.list_user_cong_cong = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date);
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));
        
        let list_dexuat = await de_xuat.find(
            {
                "noi_dung.xac_nhan_cong.ca_xnc":{$ne:null},
                com_id:com_id,
                $and:[
                    {
                        time_create:{$gte:start_date}
                    },
                    {
                        time_create:{$lte:end_date}
                    }
                ]
            }
        ).lean();

        let listUserId = [];
        for(let i=0; i<list_dexuat.length; i++){
            listUserId.push(list_dexuat[i].id_user);
        };
        
        let listUser = await User.find({idQLC:{$in:listUserId},type:{$ne:1}},{password:0}).lean();

        return res.status(200).json({ data: {
            listUser,
            list_dexuat
        }, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty delete_contract", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
};

// danh sách nhân viên thưởng phạt 
exports.list_nv_thuong_phat = async (req, res) => {
    try{
        const com_id = Number(req.body.com_id);
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date);
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));
        
        let list_dexuat = await de_xuat.find(
            {
                "noi_dung.thuong_phat.nguoi_tp":{$ne:null},
                com_id:com_id,
                $and:[
                    {
                        time_create:{$gte:start_date}
                    },
                    {
                        time_create:{$lte:end_date}
                    }
                ]
            }
        ).lean();

        let listUserId = [];
        for(let i=0; i<list_dexuat.length; i++){
            listUserId.push(list_dexuat[i].id_user);
        };
        
        let listUser = await User.find({idQLC:{$in:listUserId},type:{$ne:1}},{password:0}).lean();

        return res.status(200).json({ data: {
            listUser,
            list_dexuat
        }, message: "success"});
    }catch (error) {
        console.error("controller/tinhluong/congty delete_contract", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
};