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
const TinhluongFormSalary = require('../../models/Tinhluong/TinhluongFormSalary');

const User = require('../../models/Users');


// 1 ca hoàn thành 
// 2 ca chưa hoàn thành 
// 3 ca nghỉ 
// 4 ca muộn 
exports.qly_ttnv= async (req, res) => {
    try{
        console.log(req.body);
        const ep_id = Number(req.body.ep_id);
        const cp = Number(req.body.cp);
        const year = Number(req.body.year);
        const month = Number(req.body.month);
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date); // 23:59:59 của ngày kết thúc 
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));

        // công chuẩn 
        let count_standard_works = await NhanVienService.take_count_standard_works(cp,year,month);
        let time_check = null; 
        let count_real_works = await NhanVienService.take_count_real_works(ep_id,cp,start_date,end_date,time_check);

        // công đi muộn về sớm 
        let count_late_early = await NhanVienService.get_list_timekeeping_late_early_by_employee(ep_id,cp,start_date,end_date);
        
        // công ghi nhận thêm 
        let get_dx_cong_tl365 = await NhanVienService.get_dx_cong_tl365(ep_id,cp,start_date,end_date);

        // lịch làm việc 
        let list_cycle = await NhanVienService.get_circle_em_detail(ep_id,cp,start_date,end_date);

        // dữ liệu chấm công 
        let listData = await CC365_TimeSheet.aggregate([
            {   
                $lookup: { 
                    from: 'shifts', 
                    localField: 'shift_id', 
                    foreignField: 'shift_id', 
                    as: 'shift' 
                } 
            },
            {
                $match:{
                    "ep_id":ep_id,
                    $and:[
                        {
                            "at_time":{"$gte": start_date}
                        },
                        {
                            "at_time":{"$lte": end_date}
                        }
                    ]
                }
            },
            {  
                $project:{
                    "ep_id":1,
                    "sheet_id":1,
                    "shift_id":1,
                    "at_time":1,
                    "shift.start_time":1,
                    "shift.end_time":1,
                    "shift.start_time_latest":1,
                    "shift.end_time_earliest":1,
                    "shift.num_to_money":1,
                    "shift.shift_type":1,
                    "shift.num_to_calculate":1,
                    "shift.is_overtime":1,
                }
            }
        ]);
        let data_final = [];
        for(let i = 0; i <list_cycle.length; i++) {
            let cycle = list_cycle[i];
            let listTimeSheetOnCircle = listData.filter((e)=> 
            ( e.at_time.getDate() == cycle.date.getDate()) && 
            ( e.shift_id == cycle.shift_id)
            );
            // tăng dần 
            listTimeSheetOnCircle = listTimeSheetOnCircle.sort((a, b) => {
            return a.at_time - b.at_time;
            });
            let start_real = listTimeSheetOnCircle[0].at_time;
            let start_time_shift_str = listTimeSheetOnCircle[0].shift[0].start_time;
            let start_time = new Date(
                start_real.getFullYear(),start_real.getMonth(),start_real.getDate(),
                Number(start_time_shift_str.split(':')[0]),
                Number(start_time_shift_str.split(':')[1]),
                Number(start_time_shift_str.split(':')[2]),
            )

            let end_real = listTimeSheetOnCircle[listTimeSheetOnCircle.length -1].at_time;
            let end_time_shift_str = listTimeSheetOnCircle[0].shift[0].end_time;
            let end_time = new Date(
                end_real.getFullYear(),end_real.getMonth(),end_real.getDate(),
                Number(end_time_shift_str.split(':')[0]),
                Number(end_time_shift_str.split(':')[1]),
                Number(end_time_shift_str.split(':')[2]),
            );
            
            let end_max_shift_str = listTimeSheetOnCircle[0].shift[0].end_time_earliest;
            let end_time_max = new Date(
                end_real.getFullYear(),end_real.getMonth(),end_real.getDate(),
                Number(end_max_shift_str.split(':')[0]),
                Number(end_max_shift_str.split(':')[1]),
                Number(end_max_shift_str.split(':')[2]),
            );

            let start_min_shift_str = listTimeSheetOnCircle[0].shift[0].start_time_latest;
            let start_time_min = new Date(
                start_real.getFullYear(),start_real.getMonth(),start_real.getDate(),
                Number(start_min_shift_str.split(':')[0]),
                Number(start_min_shift_str.split(':')[1]),
                Number(start_min_shift_str.split(':')[2]),
            );
            // tìm ra từ 2 lần chấm công nằm trong khoảng thời gian cho phép 
            let listTimeSheetRealOnShift = listTimeSheetOnCircle.filter((e)=>
                    (e.at_time < end_time_max) && (e.at_time > start_time_min)
            );
            if(listTimeSheetRealOnShift.length > 1){
                let late = 0;
                let early = 0;
                
                if(listTimeSheetRealOnShift[0].at_time > start_time){
                    let tempt2 = Math. round(Math.abs(listTimeSheetRealOnShift[0].at_time - start_time) / 1000);
                    late = late + tempt2;
                }

                if(listTimeSheetRealOnShift[listTimeSheetRealOnShift.length -1].at_time < end_time){
                    let tempt2 = Math. round(Math.abs(listTimeSheetRealOnShift[listTimeSheetRealOnShift.length -1].at_time - end_time) / 1000);
                    early = early + tempt2;
                }
                if(late || early){
                    data_final.push({
                        detail_cycle:cycle,
                        content:"Ca đi muộn về sớm",
                        type:3,
                    })
                }
                else{
                    data_final.push({
                        detail_cycle:cycle,
                        content:"Ca hoàn thành",
                        type:1,
                    })
                }
            }
            else{
                // ca chưa hoàn thành 
                if(listTimeSheetRealOnShift.length == 1){
                    data_final.push({
                        detail_cycle:cycle,
                        content:"Ca chưa hoàn thành",
                        type:2,
                    })
                }
                // ca nghỉ 
                if(listTimeSheetRealOnShift.length == 0){
                    data_final.push({
                        detail_cycle:cycle,
                        content:"Ca nghỉ",
                        type:3,
                    })
                }
            }

        }
        return res.status(200).json({ data: {
            count_standard_works,
            get_dx_cong_tl365,
            count_late_early,
            count_real_works,
            list_cycle,
            data_cham_cong:listData,
            data_final
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}

// switch ($row['position_id']){
//     case 1:
//     $position_name = "Thực tập sinh";
//     break;
//     case 2:
//     $position_name = "Thử việc";
//     break;
//     case 3:
//     $position_name = "Nhân viên";
//     break;
//     case 4:
//     $position_name = "Trưởng nhóm";
//     break;
//     case 5:
//     $position_name = "Phó phòng";
//     break;
//     case 6:
//     $position_name = "Trưởng phòng";
//     break;
//     case 7:
//     $position_name = "Phó giám đốc";
//     break;
//     case 8:
//     $position_name = "Giám Đốc và Cấp Cao Hơn";
//     break;
//     default:
//     $position_name = "Chức vụ khác";
//     break;
// }
exports.qly_ho_so_ca_nhan = async (req, res) => {
    try{
        const ep_id = Number(req.body.ep_id);
        const cp = Number(req.body.cp);
        // thông tin phòng ban, công ty , nhân viên 
        let info_dep_com = await NhanVienService.take_info_dep_com(ep_id,cp);
        let info_emp_start = await Tinhluong365EmpStart.findOne({st_ep_id:ep_id}).lean();
        let info_basic_salary = await Tinhluong365SalaryBasic.find({sb_id_user:ep_id}).lean();
        let info_contract = await Tinhluong365Contract.find({con_id_user:ep_id}).lean();
        let info_family = await Tinhluong365Family.find({fa_id_user:ep_id}).lean();
        let info_donate = await TinhluongDonate.find({don_id_user:ep_id}).lean();
        // Thông tin bảo hiểm 
        let info_class = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {cls_id_user:ep_id},
                        {cls_id_com:cp},
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
        return res.status(200).json({ data: {
            info_dep_com,
            info_emp_start,
            info_basic_salary,
            info_contract,
            info_family,
            info_donate,
            info_class
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien qly_ttnv", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}
const bao_hiem = async (id,loai,time)=>{
    try{
        let checktime = new Date(new Date().getFullYear(),new Date().getMonth(),1);
        if(time){
            checktime = time;
        };
        if(loai == 3){
            let ttt = await TinhluongClass.aggregate([
                {
                    $match:{
                        $and:[
                            {cls_id_user:id},
                            {cls_id_cl:loai},
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
                        "TinhluongListClass.cl_active":1
                    }
                },
                {
                    $limit:1
                },
                {
                    $project:{
                        cls_salary:1
                    }
                }
            ]);
            if(ttt && ttt.length){
                return ttt[0].cls_salary
            }
            else{
                return false;
            }
        }
        else if(loai == 4){
           let data = await Tinhluong365SalaryBasic.find({
              sb_id_user:id,
              sb_time_up:{$lte:checktime}
           }).sort({sb_time_up:-1}).lean();
           if(data){
              return (Number(data.sb_salary_basic) + Number(data.sb_pc_bh)*10.5/100)
           }
           else{
              return false;
           }
        }
        else if(loai == 5){
            let data = await Tinhluong365SalaryBasic.find({
                sb_id_user:id,
                sb_time_up:{$lte:checktime}
             }).sort({sb_time_up:-1}).lean();
             if(data){
                return (Number(data.sb_salary_basic)*10.5/100)
             }
             else{
                return false;
             }
        }
    }
    catch(e){

    }
}
// cp:cp,
// m:m,
// y:y,
// ep_id:ep_id,
// start_date:start_date,
// end_date:end_date,
// show_payroll_user
exports.show_payroll_user = async (req, res) => {
    try{
        const ep_id = Number(req.body.ep_id);
        const cp = Number(req.body.cp);
        const month = Number(req.body.month);
        const year = Number(req.body.year);
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date); // 23:59:59 của ngày kết thúc 
        start_date = new Date(start_date.setSeconds(start_date.getSeconds()-1));
        end_date = new Date(end_date.setSeconds(end_date.getSeconds()+1));
        // thông tin nhân viên 
        let user_info = await User.findOne({
            idQLC:ep_id,
            $or:[
                {type : 0},
                {type : 2}
            ]
        }).lean();
        
        // ngày bắt đầu tính lương 
        let day_start_salary = await Tinhluong365EmpStart.findOne({st_ep_id:ep_id},{st_time:1}).lean();
        
        // lấy số người phụ thuộc 
        let so_nguoi = await Tinhluong365Family.countDocuments({
            fa_id_user:ep_id,
            fa_status:'1',
            fa_time_created:{$lte:end_date}
        })
        
        //lấy mức lương hiện tại và lương đóng bảo hiểm
        let luong = 0;
        let luong_bh = 0;
        let data_salary = await Tinhluong365SalaryBasic.find(
            {
                sb_id_user:ep_id,
                sb_time_up:{$lte:end_date}
            },
            {
                sb_salary_basic:1,
                sb_salary_bh:1
            }
        ).sort({sb_time_up:-1}).limit(1).lean();
        if(data_salary && data_salary.length){
            luong = data_salary[0].sb_salary_basic;
            luong_bh = data_salary[0].sb_salary_bh
        }

        // lấy dữ liệu hợp đồng 
        let pt_hop_dong = '--'
        let data_contract = await Tinhluong365Contract.find(
            {
                con_id_user:ep_id,
                con_time_up:{$lte:start_date},
                $or:[
                    {con_time_end:new Date('1970-01-01T00:00:00.000+00:00')},
                    {con_time_end:{$lte:end_date}},
                ]
            }
        ).sort({con_time_up:-1}).limit(1).lean();
        if(data_contract && data_contract.length){
            pt_hop_dong = data_contract[0].con_salary_persent
        };

        // Lấy khoản đóng góp
        let donate = '';
        let donate_data = TinhluongDonate.find(
            {
                don_id_user:ep_id,
                don_time_end:{$lte:end_date},
                don_time_active:{$lte:start_date}
            },
            {don_price:1}
        ).lean();
        for(let i = 0; i < donate_data.length; i++){
            donate = `${donate}${donate_data[i].don_price}`
        }

        //lấy thưởng phạt
        let thuong= 0;
        let phat = 0;
        let thuong_phat_data = await Tinhluong365ThuongPhat.find(
            {
                pay_id_user: ep_id,
                pay_month:month,
                pay_year:year,
                pay_day:{$gte:start_date},
            },
            {
                pay_id:1,
                pay_price:1,
                pay_case:1,
                pay_status:1
            }
        ).lean();
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
        let cong_chuan = await NhanVienService.take_count_standard_works(cp,year,month);
        
        
        // lấy lịch làm việc của tháng đó 
        let data_circle = await NhanVienService.get_circle_em(ep_id,cp,new Date(req.body.start_date),new Date(req.body.end_date));

        // lấy dữ liệu chấm công 
        let data_time_sheet = await CC365_TimeSheet.find(
            {
                ep_id:ep_id,
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
        // console.log(data_time_sheet)
        
         
        //phạt nghỉ k đúng quy định
        //có lịch mà không chắm công 
        //không chấm công không phép 
        let data_ko_cc = [];
        let data_ko_cc_co_phep = [];
        let tien_phat_nghi_khong_phep = 0;

        // lấy số ca có lịch làm việc mà không chấm công 
        // console.log(data_circle);
        for(let i = 0; i <data_circle.length; i++ ){
            if(new Date() > data_circle[i].date){
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
        }
        // console.log("Dữ liệu không chấm công",data_ko_cc);
        let list_de_xuat_duyet = await NhanVienService.get_de_xuat_tl365(ep_id,cp,start_date,end_date);
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
            // console.log(data_ko_cc,co_phep_count);
            let k_phep = data_ko_cc[i].count - co_phep_count;
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
                // console.log(data_phat_nghi_ko_phep[0].pc_money,k_phep);
                tien_phat_nghi_khong_phep = k_phep * data_phat_nghi_ko_phep[0].pc_money;
                // console.log('Không phép sau khi cộng',tien_phat_nghi_khong_phep)
            }
        }
        
        //lấy phạt đi muộn về sớm
        let tien_phat_muon = 0;
        let cong_phat_muon = [];
        let data_late_early = await NhanVienService.get_list_timekeeping_late_early_by_employee(ep_id,cp,start_date,end_date);

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
                                //     {pm_time_end:{$lte:end_date}},
                                //     {pm_time_end:null},
                                // ],
                                pm_shift:obj.shift_id,
                                pm_minute :{$lte:obj.late}
                            }
                        ).sort({pm_minute:-1}).limit(1).lean();
                        if(list_pm.length){
                            list_pm = list_pm.filter((e)=> (e.pm_time_end == null)|| (e.pm_time_end < end_date) || (e.pm_time_end == new Date('1970-01-01T00:00:00.000+00:00')));
                            // console.log("Dữ liệu phạt muộn",list_pm)
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
        let cong_sau_phat = 0;
        let so_cong_phat_muon = 0;
        // lấy công có chấm công đầy đủ vào ra và có lịch làm viêc
        let count_real_works = await NhanVienService.take_count_real_works(ep_id,cp,
            new Date(new Date(req.body.start_date).setSeconds(new Date(req.body.start_date).getSeconds()-1)),
            new Date(new Date(req.body.end_date).setSeconds(new Date(req.body.end_date).getSeconds()+1))
        );

        // lấy danh sách hợp đồng của nhân viên đó 
        let list_contract = await Tinhluong365Contract.find(
            {
                con_id_user:ep_id,
                con_time_up:{$lte:start_date},
                $or:[
                    {
                        con_time_end:new Date('1970-01-01T00:00:00.000+00:00')
                    },
                    {
                        con_time_end:{
                            $gte:end_date
                        }
                    }
                ]
            },
            {
                con_salary_persent:1,
                con_time_up:1,
                con_time_end:1
            }
        ).sort({con_time_up:-1}).lean();
        
        // lấy data lương 
        let list_data_salary = await Tinhluong365SalaryBasic.find(
            {
                sb_id_user:ep_id,
                sb_time_up:{$lte:end_date}  // lấy khổ rông nhất 
            },
            {   
                sb_time_up:1,
                sb_salary_basic:1 
            }
        ).sort({sb_time_up:-1}).lean();

        // lấy từng đối tượng để sử lý trường hợp sửa lương giữa tháng 
        // console.log('Danh sách hợp đồng',list_contract)
        if(count_real_works.length && list_contract.length){
            for(let i = 0; i < count_real_works.length;i++){
                cong_thuc = cong_thuc + count_real_works[i].num_to_calculate;
                cong_sau_phat = cong_sau_phat + count_real_works[i].num_to_calculate;
                let cong_them = count_real_works[i].num_to_calculate;
                let cong_data = count_real_works[i];
                // công 1 ngày sau phạt muộn => có công mới phạt 
                let list_cong_phat = cong_phat_muon.filter((e)=> ( e.date.getDate() == cong_data.ts_date.getDate() ));
                for(let j = 0; j < list_cong_phat.length; j++){
                    // phạt muộn , phạt muộn bằng công 
                    if(list_cong_phat[j].cong){
                        // cong_thuc = cong_thuc - list_cong_phat[j].cong;
                        cong_sau_phat= cong_sau_phat - list_cong_phat[j].cong;
                        cong_them = cong_them - list_cong_phat[j].cong;  // để tính lương sau khi bị phạt công 
                        so_cong_phat_muon = so_cong_phat_muon + list_cong_phat[j].cong;
                    }
                }
                // lấy hợp đồng 
                let contract_info = list_contract.find((e)=>
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
                        luong_sau_phat = luong_sau_phat + Number(data_luong.sb_salary_basic) / cong_chuan * phan_tram_hop_dong / 100 * cong_them;
                    }
                }

            }
        }

        // lấy công ghi nhận thêm 
        let get_dx_cong_tl365 = await NhanVienService.get_dx_cong_tl365(ep_id,cp,start_date,end_date);
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
        let data_phuc_loi = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {cls_id_user:ep_id},
                        {cls_day:{$lte:end_date}},
                        {cls_id_com:cp}
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
                }
            }
        ])
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
        let data_phu_cap = await TinhluongClass.aggregate([
            {
                $match:{
                    cls_id_user:ep_id,
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
                    cls_day_end:1
                }
            }
        ])
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
        let data_bao_hiem = await TinhluongClass.aggregate([
            {
                $match:{
                    $and:[
                        {cls_id_user:ep_id},
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
        ]);

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
        };
        // console.log('data_bao_hiem_final',data_bao_hiem_final)
        for(let i=0; i < data_bao_hiem_final.length ; i++){
            let bh = 0;
            if(data_bao_hiem_final[i].cls_id_cl == 3){
                // console.log("Dữ liệu thêm bảo hiểm");
                let add_bh = await bao_hiem(ep_id, 3);
                // console.log(add_bh);
                bh = bh +  add_bh;
            }
            if(data_bao_hiem_final[i].cls_id_cl == 4){
                bh = bh +  await bao_hiem(ep_id, 4);
            }
            if(data_bao_hiem_final[i].cls_id_cl == 5){
                bh = bh +  await bao_hiem(ep_id, 5);
            }
            // công thức  bảo hiểm do người dùng nhập vào 
            // if(data_bao_hiem_final.cls_id_cl > 5){
            //     cong_thuc_tuy_chinh
            // }
            //tong_bao_hiem = tong_bao_hiem + bh;
            //console.log("tong_bao_hiem",i,bh,tong_bao_hiem);
        }
        // lấy các loại tiền khác
        let tien_khac = 0;
        // hoa hồng cá nhân của nhân viên
        let hoa_hong_ca_nhan = await TinhluongRose.aggregate([
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
                            ro_id_user: ep_id
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
        let hoa_hong_nhom = await TinhluongRose.aggregate([
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
        console.log(luong_sau_phat,luong_nghi_le ,tong_hoa_hong,tien_tam_ung,tien_phat_muon,thuong,phat,tien_phat_nghi_khong_phep ,tien_phuc_loi,tien_phu_cap ,tong_bao_hiem)
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
        return res.status(200).json({ data: {
            luong_co_ban:list_data_salary[0].sb_salary_basic,
            phan_tram_hop_dong:Number(list_contract[0].con_salary_persent),
            cong_chuan,
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
        }, message: "success" });
    }catch (error) {
        console.error("controller/tinhluong/nhanvien show_payroll_user", error);
        return res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
}