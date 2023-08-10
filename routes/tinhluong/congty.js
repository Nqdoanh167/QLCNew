const router = require('express').Router();
const congty = require("../../controllers/tinhluong/congty") 
const formData = require('express-form-data');

// quản lý nhân sự 
router.post('/list_em_no_job',formData.parse(), congty.list_em_no_job);
router.post('/list_em',formData.parse(), congty.list_em);

// thưởng phạt 
router.post('/take_thuong_phat',formData.parse(), congty.take_thuong_phat);
router.post('/take_thuong_phat_em',formData.parse(), congty.take_thuong_phat_em);
router.post('/insert_thuong_phat',formData.parse(), congty.insert_thuong_phat);
router.post('/edit_thuong_phat',formData.parse(), congty.edit_thuong_phat);
router.post('/delete_thuong_phat',formData.parse(), congty.delete_thuong_phat);

// lương cơ bản 
router.post('/insert_basic_salary',formData.parse(), congty.insert_basic_salary);
router.post('/take_salary_contract',formData.parse(), congty.take_salary_contract);
router.post('/delete_basic_salary',formData.parse(), congty.delete_basic_salary);
router.post('/update_basic_salary',formData.parse(), congty.update_basic_salary);
router.post('/take_salary_em',formData.parse(), congty.take_salary_em);

// phúc lợi 
router.post('/insert_phuc_loi',formData.parse(), congty.insert_phuc_loi);
router.post('/take_phuc_loi',formData.parse(), congty.take_phuc_loi);
router.post('/insert_wf_shift',formData.parse(), congty.insert_wf_shift);
router.post('/edit_wf_shift',formData.parse(), congty.edit_wf_shift);
router.post('/sua_phuc_loi',formData.parse(), congty.sua_phuc_loi); 
router.post('/sua_nc_phuc_loi_tro_cap',formData.parse(), congty.sua_nc_phuc_loi_tro_cap);
router.post('/insert_phuc_loi_nhom',formData.parse(), congty.insert_phuc_loi_nhom);
router.post('/them_nv_nhom',formData.parse(), congty.them_nv_nhom);
router.post('/take_list_nv_nhom',formData.parse(), congty.take_list_nv_nhom);
router.post('/delete_nv_nhom',formData.parse(), congty.delete_nv_nhom);
router.post('/show_list_user_phuc_loi_com',formData.parse(), congty.show_list_user_phuc_loi_com);
router.post('/delete_wf_shift',formData.parse(), congty.delete_wf_shift);
router.post('/delete_phuc_loi',formData.parse(), congty.delete_phuc_loi);
router.post('/edit_phuc_loi',formData.parse(), congty.edit_phuc_loi);

router.post('/them_thiet_lap',formData.parse(), congty.them_thiet_lap);
router.post('/capnhat_thiet_lap_minmaxphantram',formData.parse(), congty.capnhat_thiet_lap_minmaxphantram);
router.post('/capnhat_thiet_lap_chiphi',formData.parse(), congty.capnhat_thiet_lap_chiphi);
router.post('/capnhat_thiet_lap_hoahong',formData.parse(), congty.capnhat_thiet_lap_hoahong);
router.post('/capnhat_thiet_lap_kpi',formData.parse(), congty.capnhat_thiet_lap_kpi);
router.post('/take_thiet_lap_com',formData.parse(), congty.take_thiet_lap_com);
router.post('/insert_rose',formData.parse(), congty.insert_rose);
router.post('/take_all_data_rose',formData.parse(), congty.take_all_data_rose);
router.post('/lay_tien_ca_nhan',formData.parse(), congty.lay_tien_ca_nhan);
router.post('/lay_tien_ca_nhan_theo_nhom',formData.parse(), congty.lay_tien_ca_nhan_theo_nhom);

// tiền khác 
// show_listuser_setted_other_money
router.post('/show_listuser_setted_other_money',formData.parse(), congty.show_listuser_setted_other_money);
router.post('/insert_other_money',formData.parse(), congty.insert_other_money);
router.post('/show_other_money',formData.parse(), congty.show_other_money);
router.post('/edit_other_money',formData.parse(), congty.edit_other_money);
router.post('/takeinfo_other_money_additional',formData.parse(), congty.takeinfo_other_money_additional);
router.post('/delete_nv_nhom_other_money',formData.parse(), congty.delete_nv_nhom_other_money);
router.post('/them_nv_nhom_other_money',formData.parse(), congty.them_nv_nhom_other_money);
router.post('/take_list_nv_nhom_other_money',formData.parse(), congty.take_list_nv_nhom_other_money);
router.post('/delete_other_money',formData.parse(), congty.delete_other_money);

// bảo hiểm 
router.post('/insert_insrc',formData.parse(), congty.insert_insrc);
router.post('/takeinfo_insrc',formData.parse(), congty.takeinfo_insrc);
router.post('/update_insrc',formData.parse(), congty.update_insrc);
router.post('/show_list_user_insrc',formData.parse(), congty.show_list_user_insrc);
router.post('/show_list_user_noinsrc',formData.parse(), congty.show_list_user_noinsrc);
router.post('/them_nv_nhom_insrc',formData.parse(), congty.them_nv_nhom_insrc);
router.post('/take_list_nv_insrc',formData.parse(), congty.take_list_nv_insrc);
router.post('/delete_nv_insrc',formData.parse(), congty.delete_nv_insrc);
router.post('/insert_category_insrc',formData.parse(), congty.insert_category_insrc);



// bảng lương nhân viên 
router.post('/show_bangluong_nv',formData.parse(), congty.show_bangluong_nv);

// thuế 
router.post('/takeinfo_tax_com',formData.parse(), congty.takeinfo_tax_com);
router.post('/insert_category_tax',formData.parse(), congty.insert_category_tax);
router.post('/update_tax_com',formData.parse(), congty.update_tax_com);
router.post('/show_list_user_tax',formData.parse(), congty.show_list_user_tax);
router.post('/show_list_user_no_tax',formData.parse(), congty.show_list_user_no_tax);
router.post('/them_nv_nhom_tax',formData.parse(), congty.them_nv_nhom_tax);
router.post('/take_list_nv_tax',formData.parse(), congty.take_list_nv_tax);
router.post('/delete_nv_tax',formData.parse(), congty.delete_nv_tax);
router.post('/edit_nv_tax',formData.parse(), congty.edit_nv_tax);

// quản lý chi trả lương 
router.post('/takeinfo_payment',formData.parse(), congty.takeinfo_payment);
router.post('/insert_info_payment',formData.parse(), congty.insert_info_payment);
router.post('/updateinfo_payment',formData.parse(), congty.updateinfo_payment);

// báo cáo công lương 
router.post('/takedata_salary_report',formData.parse(), congty.takedata_salary_report);

// cài đặt nhóm làm việc 
router.post('/insert_group',formData.parse(), congty.insert_group);
router.post('/takedata_group_com',formData.parse(), congty.takedata_group_com);
router.post('/update_group_com',formData.parse(), congty.update_group_com);
router.post('/delete_group_com',formData.parse(), congty.delete_group_com);
router.post('/add_people_group',formData.parse(), congty.add_people_group);
router.post('/take_member_many_group',formData.parse(), congty.take_member_many_group);
router.post('/takeinfo_member_group_com',formData.parse(), congty.takeinfo_member_group_com);

// cài đặt đi muộn về sớm 
router.post('/insert_phat_muon',formData.parse(), congty.insert_phat_muon);
router.post('/update_phat_muon',formData.parse(), congty.update_phat_muon);
router.post('/takeinfo_phat_muon',formData.parse(), congty.takeinfo_phat_muon);
router.post('/show_staff_late',formData.parse(), congty.show_staff_late);
router.post('/delete_phat_muon',formData.parse(), congty.delete_phat_muon);
// cài đặt nghỉ phép
router.post('/takeinfo_phat_ca_com',formData.parse(), congty.takeinfo_phat_ca_com);
router.post('/update_phat_ca',formData.parse(), congty.update_phat_ca);
router.post('/delete_phat_ca',formData.parse(), congty.delete_phat_ca);
router.post('/insert_phat_ca',formData.parse(), congty.insert_phat_ca);
router.post('/lay_thong_tin_nghi_phep',formData.parse(), congty.lay_thong_tin_nghi_phep);
router.post('/lay_de_xuat_congty',formData.parse(), congty.lay_de_xuat_congty);
router.post('/quan_ly_nghi_phep',formData.parse(), congty.quan_ly_nghi_phep);
router.post('/list_take',formData.parse(), congty.list_take);
router.post('/takedata_to_edit_phat_nghi',formData.parse(), congty.takedata_to_edit_phat_nghi);
router.post('/save_pn',formData.parse(), congty.save_pn);
router.post('/take_list_phat_nghi_ko_phep_com',formData.parse(), congty.take_list_phat_nghi_ko_phep_com);
router.post('/edit_phat_ca',formData.parse(), congty.edit_phat_ca);
router.post('/take_listuser_nghi_khong_phep',formData.parse(), congty.take_listuser_nghi_khong_phep);
// hợp đồng sss
router.post('/insert_contract',formData.parse(), congty.insert_contract);
router.post('/delete_contract',formData.parse(), congty.delete_contract);
router.post('/edit_contract',formData.parse(), congty.edit_contract);

// danh sách cộng công 
router.post('/list_user_cong_cong',formData.parse(), congty.list_user_cong_cong);

// danh sách nhân viên thưởng phạt list_nv_thuong_phat
router.post('/list_nv_thuong_phat',formData.parse(), congty.list_nv_thuong_phat);
module.exports = router