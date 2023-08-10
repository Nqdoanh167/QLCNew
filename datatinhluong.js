const axios = require('axios');
const Tinhluong365Contract = require('./models/Tinhluong/Tinhluong365Contract');
const Tinhluong365EmpStart = require('./models/Tinhluong/Tinhluong365EmpStart'); 
const Tinhluong365SalaryBasic = require('./models/Tinhluong/Tinhluong365SalaryBasic');
const Tinhluong365ThuongPhat = require('./models/Tinhluong/Tinhluong365ThuongPhat');
const TinhluongClass = require('./models/Tinhluong/TinhluongClass');
const TinhluongDetailPayment = require('./models/Tinhluong/TinhluongDetailPayment');
const TinhluongDonate = require('./models/Tinhluong/TinhluongDonate');
const TinhluongFamily = require('./models/Tinhluong/TinhluongFamily'); 
const TinhluongForm = require('./models/Tinhluong/TinhluongForm');
const TinhluongFormSalary = require('./models/Tinhluong/TinhluongFormSalary');
const TinhluongGroup = require('./models/Tinhluong/TinhluongGroup');
const TinhluongHoliday = require('./models/Tinhluong/TinhluongHoliday');
const TinhluongListGroup = require('./models/Tinhluong/TinhluongListGroup');
const TinhluongListNghiPhep = require('./models/Tinhluong/TinhluongListNghiPhep'); 
const TinhluongListRose = require('./models/Tinhluong/TinhluongListRose'); 
const TinhluongPayment = require('./models/Tinhluong/TinhluongPayment'); 
const TinhluongPhatCa = require('./models/Tinhluong/TinhluongPhatCa'); 
const TinhluongPhatMuon = require('./models/Tinhluong/TinhluongPhatMuon'); 
const TinhluongListClass = require('./models/Tinhluong/TinhluongListClass'); 
const TinhluongPercentGr = require('./models/Tinhluong/TinhluongPercentGr');
const TinhluongRose = require('./models/Tinhluong/TinhluongRose');
const TinhluongWelfareShift = require('./models/Tinhluong/TinhluongWelfareShift');
const TinhluongThietLap = require('./models/Tinhluong/TinhluongThietLap');
const CC365_Cycle = require('./models/Chamcong/CC365_Cycle');

let TakeDataContract = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_contract`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let contract = response.data[i];
                await Tinhluong365Contract.deleteOne({con_id:Number(contract.con_id)})
                let con_time_end = contract.con_time_end || new Date('1970-01-01T00:00:00.000+00:00');
                if(String(con_time_end) == "0000-00-00"){
                    con_time_end = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(con_time_end) == 'null'){
                    con_time_end = new Date('1970-01-01T00:00:00.000+00:00');
                }
                let newobj = new Tinhluong365Contract({
                    con_id:Number(contract.con_id),
                    con_id_user:Number(contract.con_id_user),
                    con_name:String(contract.con_name),
                    con_time_up: new Date(contract.con_time_up),
                    con_time_end,
                    con_file:String(contract.con_file),
                    con_salary_persent:Number(contract.con_salary_persent)
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        }
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}

let TakeDataTinhluong365EmpStart = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_emp_start`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let empstart = response.data[i];
                let st_id = Number(empstart.st_id);
                let st_ep_id = Number(empstart.st_ep_id);
                let st_time = new Date(empstart.st_time) || new Date('1970-01-01T00:00:00.000+00:00');
                let st_create = new Date(empstart.st_create) || new Date('1970-01-01T00:00:00.000+00:00');
                let st_bank = String(empstart.st_bank) || "";
                let st_stk = String(empstart.st_stk) || "";
                await Tinhluong365EmpStart.deleteOne({st_id:st_id})

                let newobj = new Tinhluong365EmpStart({
                    st_id,
                    st_ep_id,
                    st_time,
                    st_create,
                    st_bank,
                    st_stk
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}
let TakeTinhluong365SalaryBasic = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_salary_basic`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let salarybasic = response.data[i];
                await Tinhluong365SalaryBasic.deleteOne({sb_id:Number(salarybasic.sb_id)})

                let newobj = new Tinhluong365SalaryBasic(salarybasic) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}

let TakeTinhluong365ThuongPhat = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_thuong_phat`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let thuongphat = response.data[i];
                await Tinhluong365ThuongPhat.deleteOne({pay_id:Number(thuongphat.pay_id)})
                let newobj = new Tinhluong365ThuongPhat(thuongphat) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}

let TakeTinhluong365DataClass = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_class`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let classobj = response.data[i];
                let cls_id = Number(classobj.cls_id)||0;
                let cls_id_cl = Number(classobj.cls_id_cl)||0;
                let cls_id_user = Number(classobj.cls_id_user)||0;
                let cls_id_group = Number(classobj.cls_id_group)||0;
                let cls_id_com = Number(classobj.cls_id_com)||0;
                let cls_day = new Date(classobj.cls_day) || new Date('1970-01-01T00:00:00.000+00:00');
                if(String(classobj.cls_day) == "0000-00-00"){
                    cls_day = new Date('1970-01-01T00:00:00.000+00:00')
                };
                let cls_day_end = new Date(classobj.cls_day_end)|| new Date('1970-01-01T00:00:00.000+00:00');
                if(String(classobj.cls_day_end) == "0000-00-00"){
                    cls_day_end = new Date('1970-01-01T00:00:00.000+00:00')
                };
                let cls_salary = Number(classobj.cls_salary)||0;
                let cls_custom = Number(classobj.cls_custom)||0;
                let cls_time_created =  new Date(classobj.cls_time_created)|| new Date('1970-01-01T00:00:00.000+00:00');
                if(String(classobj.cls_time_created) == "0000-00-00"){
                    cls_time_created = new Date('1970-01-01T00:00:00.000+00:00')
                };
                await TinhluongClass.deleteOne({cls_id:Number(classobj.cls_id)})
                let newobj = new TinhluongClass({
                    cls_id,
                    cls_id_cl,
                    cls_id_user,
                    cls_id_group,
                    cls_id_com,
                    cls_day,
                    cls_day_end,
                    cls_salary,
                    cls_custom,
                    cls_time_created
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}
let TakeTinhluongDetailPayment = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_detail_payment`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let detailpayment = response.data[i];
                await TinhluongDetailPayment.deleteOne({dp_id:Number(detailpayment.dp_id)})
                let newobj = new TinhluongDetailPayment(detailpayment) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}
let TakeTinhluongDonate = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_donate`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let donation = response.data[i];
                let don_id = Number(donation.don_id);
                let don_id_user = Number(donation.don_id_user)||0;
                let don_name = String(donation.don_name);
                let don_price = Number(donation.don_price);
                let don_time_end = new Date(donation.don_time_end) || new Date('1970-01-01T00:00:00.000+00:00');
                if(String(donation.don_time_end) == "0000-00-00"){
                    don_time_end = new Date('1970-01-01T00:00:00.000+00:00');
                }
                let don_time_active = new Date(donation.don_time_active) || new Date('1970-01-01T00:00:00.000+00:00');
                if(String(donation.don_time_active) == "0000-00-00"){
                    don_time_active = new Date('1970-01-01T00:00:00.000+00:00');
                }
                let don_time_created = new Date(donation.don_time_created) || new Date('1970-01-01T00:00:00.000+00:00');
                if(String(donation.don_time_created) == "0000-00-00"){
                    don_time_created = new Date('1970-01-01T00:00:00.000+00:00');
                }
                await TinhluongDonate.deleteOne({don_id:Number(donation.don_id)})
                let newobj = new TinhluongDonate({
                    don_id,
                    don_id_user,
                    don_name,
                    don_price,
                    don_time_end,
                    don_time_active,
                    don_time_created
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}
let TakeTinhluongFamily = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_family`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let family = response.data[i];
                await TinhluongFamily.deleteOne({fa_id:Number(family.fa_id)})
                let newobj = new TinhluongFamily(family) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}
let TakeTinhluongForm = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_form`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let form = response.data[i];
                await TinhluongForm.deleteOne({fr_id:Number(form.fr_id)})
                let fr_id = Number(form.fr_id)||0;
                let fr_id_lf = Number(form.fr_id_lf)||0;
                let fr_class_off = Number(form.fr_class_off)||0;
                let fr_id_user = Number(form.fr_id_user)||0;
                let fr_user_name = String(form.fr_user_name)||"";

                let fr_room = Number(form.fr_room)||0;
                let ft_ca_nghi = String(form.ft_ca_nghi)||"";
                let fr_fist_time = new Date(form.fr_fist_time) || new Date('1970-01-01T00:00:00.000+00:00');
                if(String(form.fr_fist_time) == "0000-00-00"){
                    fr_fist_time = new Date('1970-01-01T00:00:00.000+00:00')
                };
                let fr_ca_fist = Number(form.fr_ca_fist)||0;

                let fr_end_time = new Date(form.fr_end_time) || new Date('1970-01-01T00:00:00.000+00:00');
                if(String(form.fr_end_time) == "0000-00-00"){
                    fr_end_time = new Date('1970-01-01T00:00:00.000+00:00')
                };

                let fr_ca_end = Number(form.fr_ca_end)||0;
                let fr_price = Number(form.fr_price)||0;
                let fr_id_admin = String(form.fr_id_admin)||"";
                let fr_admin_active = String(form.fr_admin_active)||"";
                let fr_id_com = Number(form.fr_id_com)||0;
                let fr_file = String(form.fr_file)||"";
                let fr_why = String(form.fr_why)||"";
                let fr_note = String(form.fr_note)||"";

                let fr_phat = Number(form.fr_phat)||0;
                let fr_status = Number(form.fr_status)||0;
                let active = Number(form.active)||0;
                
                let fr_time_created 
                if(form.fr_time_created){
                    fr_time_created = new Date(Number(form.fr_time_created));
                }
                else{
                    fr_time_created = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(form.fr_time_created) == "0000-00-00"){
                    fr_time_created = new Date('1970-01-01T00:00:00.000+00:00')
                };
                
                let fr_time_update;
                if(form.fr_time_update){
                    fr_time_update = new Date(form.fr_time_update);
                }
                else{
                    fr_time_update = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(form.fr_time_update) == "0000-00-00"){
                    fr_time_update = new Date('1970-01-01T00:00:00.000+00:00')
                };
               
                let newobj = new TinhluongForm({
                    fr_id,
                    fr_id_lf,
                    fr_class_off,
                    fr_id_user,
                    fr_user_name,
                    fr_room,
                    ft_ca_nghi,
                    fr_fist_time,
                    fr_ca_fist,
                    fr_end_time,
                    fr_ca_end,
                    fr_price,
                    fr_id_admin,
                    fr_admin_active,
                    fr_id_com,
                    fr_file,
                    fr_why,
                    fr_note,
                    fr_phat,
                    fr_status,
                    active,
                    fr_time_created,
                    fr_time_update
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}
let TakeTinhluongFormSalary = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_form_salary`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let formsalary = response.data[i];
                await TinhluongFamily.deleteOne({fs_id:Number(formsalary.fs_id)})
                let fs_id = Number(formsalary.fs_id)||0;
                let fs_id_com = Number(formsalary.fs_id_com)||0;
                let fs_type = Number(formsalary.fs_type)||0;
                let fs_name = String(formsalary.fs_name)||"";
                let fs_data = Number(formsalary.fs_data)||0;
                let fs_repica = String(formsalary.fs_repica)||"";
                let fs_note = String(formsalary.fs_note)||"";
                let fs_time_created;
                if(formsalary.fs_time_created){
                    fs_time_created = new Date(formsalary.fs_time_created);
                }
                else{
                    fs_time_created = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(formsalary.fs_time_created) == "0000-00-00"){
                    fs_time_created = new Date('1970-01-01T00:00:00.000+00:00')
                };
                let newobj = new TinhluongFormSalary({
                    fs_id,
                    fs_id_com,
                    fs_type,
                    fs_name,
                    fs_data,
                    fs_repica,
                    fs_note,
                    fs_time_created
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongGroup = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_group`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let group = response.data[i];
                await TinhluongGroup.deleteOne({gm_id:Number(group.gm_id)})
                let newobj = new TinhluongGroup(group) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongHoliday = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_holiday`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let holiday = response.data[i];
                await TinhluongHoliday.deleteOne({ho_id:Number(holiday.ho_id)})
                let newobj = new TinhluongHoliday(holiday) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}
let TakeTinhluongListGroup = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_list_group`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let listgroup = response.data[i];
                await TinhluongListGroup.deleteOne({lgr_id:Number(listgroup.lgr_id)})
                let newobj = new TinhluongListGroup(listgroup) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongListNghiPhep = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_list_nghiphep`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let nghiphep = response.data[i];
                await TinhluongListNghiPhep.deleteOne({of_id:Number(nghiphep.of_id)})
                let newobj = new TinhluongListNghiPhep(nghiphep) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongListRose = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_list_rose`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let rose = response.data[i];
                await TinhluongListRose.deleteOne({lr_id:Number(rose.lr_id)})
                let newobj = new TinhluongListRose(rose) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongPayment = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_payment`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let payment = response.data[i];
                await TinhluongPayment.deleteOne({lr_id:Number(payment.pay_id)})
                let newobj = new TinhluongPayment(payment) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongPhatCa = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_phat_ca`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let phatca = response.data[i];
                await TinhluongPhatCa.deleteOne({pc_id:Number(phatca.pc_id)})
                let newobj = new TinhluongPhatCa(phatca) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongPhatMuon = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_phat_muon`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let phatca = response.data[i];
                await TinhluongPhatMuon.deleteOne({pc_id:Number(phatca.pc_id)});
                let newobj = new TinhluongPhatMuon(phatca) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongListClass = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_list_class`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let listclass = response.data[i];
                await TinhluongListClass.deleteOne({cl_id:Number(listclass.cl_id)});
                let cl_id = Number(listclass.cl_id)||0;
                let cl_name = String(listclass.cl_name)||"";
                let cl_salary = Number(listclass.cl_salary)||0;
                let cl_day;
                if(listclass.cl_day){
                    cl_day = new Date(listclass.cl_day);
                }
                else{
                    cl_day = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(listclass.cl_day) == "0000-00-00"){
                    cl_day = new Date('1970-01-01T00:00:00.000+00:00')
                };

                let cl_day_end;
                if(listclass.cl_day_end){
                    cl_day_end = new Date(listclass.cl_day_end);
                }
                else{
                    cl_day_end = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(listclass.cl_day_end) == "0000-00-00"){
                    cl_day_end = new Date('1970-01-01T00:00:00.000+00:00')
                };
                let cl_active = Number(listclass.cl_active)||0;
                let cl_note = Number(listclass.cl_note)||"";
                let cl_type = Number(listclass.cl_type)||0;
                let cl_type_tax = Number(listclass.cl_type_tax)||0;
                let cl_id_form = Number(listclass.cl_id_form)||0;
                let cl_com = Number(listclass.cl_com)||0;
                let cl_time_created;
                if(listclass.cl_time_created){
                    cl_time_created = new Date(listclass.cl_time_created);
                }
                else{
                    cl_time_created = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(listclass.cl_time_created) == "0000-00-00"){
                    cl_time_created = new Date('1970-01-01T00:00:00.000+00:00')
                };
                let newobj = new TinhluongListClass({
                    cl_id,
                    cl_name,
                    cl_salary,
                    cl_day,
                    cl_day_end,
                    cl_active,
                    cl_note,
                    cl_type,
                    cl_type_tax,
                    cl_id_form,
                    cl_com,
                    cl_time_created
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongPercentGr = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_percent_gr`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let percentgr = response.data[i];
                await TinhluongPercentGr.deleteOne({pr_id:Number(percentgr.pr_id)});
                let pr_id = Number(percentgr.pr_id)||0;
                let pr_id_user = Number(percentgr.pr_id_user)||0;
                let pr_id_group = Number(percentgr.pr_id_group)||0;
                let pr_id_tl = Number(percentgr.pr_id_tl)||0;
                let pr_money = Number(percentgr.pr_money)||0;
                let pr_rose = Number(percentgr.pr_rose)||0;
                let pr_lr_type = Number(percentgr.pr_lr_type)||0;
                let pr_percent = Number(percentgr.pr_percent)||0;
                let pr_time;
                if(percentgr.pr_time){
                    pr_time = new Date(percentgr.pr_time);
                }
                else{
                    pr_time = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(percentgr.pr_time) == "0000-00-00"){
                    pr_time = new Date('1970-01-01T00:00:00.000+00:00')
                };

                let newobj = new TinhluongPercentGr({
                    pr_id,
                    pr_id_user,
                    pr_id_group,
                    pr_id_tl,
                    pr_money,
                    pr_rose,
                    pr_lr_type,
                    pr_percent,
                    pr_time
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongRose = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_rose`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let rose = response.data[i];
                await TinhluongRose.deleteOne({ro_id:Number(rose.ro_id)});
                let ro_id = Number(rose.ro_id)||0;
                let ro_id_user = Number(rose.ro_id_user)||0;
                let ro_id_group = Number(rose.ro_id_group)||0;
                let ho_id_group = Number(rose.ho_id_group)||0;
                let ro_id_com = Number(rose.ro_id_com)||0;
                let ro_id_lr = Number(rose.ro_id_lr)||0;
                let ro_id_tl = Number(rose.ro_id_tl)||0;
                let ro_so_luong = Number(rose.ro_so_luong)||0;
                let ro_time;
                if(rose.ro_time){
                    ro_time = new Date(rose.ro_time);
                }
                else{
                    ro_time = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(rose.ro_time) == "0000-00-00"){
                    ro_time = new Date('1970-01-01T00:00:00.000+00:00')
                };
                
                let ro_time_end;
                if(rose.ro_time_end){
                    ro_time_end = new Date(rose.ro_time_end);
                }
                else{
                    ro_time_end = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(rose.ro_time_end) == "0000-00-00"){
                    ro_time_end = new Date('1970-01-01T00:00:00.000+00:00')
                };

                let ro_note = String(rose.ro_note)||"";
                let ro_price = Number(rose.ro_price)||0;
                let ro_kpi_active = Number(rose.ro_kpi_active)||0;

                let ro_time_created;
                if(rose.ro_time_created){
                    ro_time_created = new Date(rose.ro_time_created);
                }
                else{
                    ro_time_created = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(rose.ro_time_created) == "0000-00-00"){
                    ro_time_created = new Date('1970-01-01T00:00:00.000+00:00')
                };

                let newobj = new TinhluongRose({
                    ro_id,
                    ro_id_user,
                    ro_id_group,
                    ho_id_group,
                    ro_id_com,
                    ro_id_lr,
                    ro_id_tl,
                    ro_so_luong,
                    ro_time,
                    ro_time_end,
                    ro_note,
                    ro_price,
                    ro_kpi_active,
                    ro_time_created
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongWelfareShift = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_welfare_shift`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let welfare = response.data[i];
                await TinhluongWelfareShift.deleteOne({wf_id:Number(welfare.wf_id)});
                let wf_id = Number(welfare.wf_id)||0;
                let wf_money = Number(welfare.wf_money)||0;
                let wf_time;
                if(welfare.wf_time){
                    wf_time = new Date(welfare.wf_time);
                }
                else{
                    wf_time = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(welfare.wf_time) == "0000-00-00"){
                    wf_time = new Date('1970-01-01T00:00:00.000+00:00')
                };
                
                let wf_time_end;
                if(welfare.wf_time_end){
                    wf_time_end = new Date(welfare.wf_time_end);
                }
                else{
                    wf_time_end = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(welfare.wf_time_end) == "0000-00-00"){
                    wf_time_end = new Date('1970-01-01T00:00:00.000+00:00')
                };

                let wf_shift = Number(welfare.wf_shift)||0;
                let wf_com = Number(welfare.wf_com)||0;

                let newobj = new TinhluongWelfareShift({
                    wf_id,
                    wf_money,
                    wf_time,
                    wf_time_end,
                    wf_shift,
                    wf_com
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

let TakeTinhluongThietLap = async()=>{
    try{
        console.log('Bắt đấu')
        let response = await axios({
            method: "post",
            url: "https://tinhluong.timviec365.vn/render/excutesql.php",
            data: {
                content:`SELECT * FROM tb_thiet_lap`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data){
            for(let i = 0; i < response.data.length; i++){
                let thietlap = response.data[i];
                await TinhluongThietLap.deleteOne({tl_id:Number(thietlap.tl_id)});
                let tl_id = Number(thietlap.tl_id)||0;
                let tl_id_com = Number(thietlap.tl_id_com)||0;
                let tl_id_rose = Number(thietlap.tl_id_rose)||0;
                let tl_name = String(thietlap.tl_name)||"";
                let tl_money_min = Number(thietlap.tl_money_min)||0;
                let tl_money_max = Number(thietlap.tl_money_max)||0;
                let tl_phan_tram = Number(thietlap.tl_phan_tram)||0;
                let tl_chiphi = Number(thietlap.tl_chiphi)||0;
                let tl_hoahong = Number(thietlap.tl_hoahong)||0;
                let tl_kpi_yes = Number(thietlap.tl_kpi_yes)||0;
                let tl_kpi_no = Number(thietlap.tl_kpi_no)||0;
                let tl_time_created;
                if(thietlap.tl_time_created){
                    tl_time_created = new Date(thietlap.tl_time_created);
                }
                else{
                    tl_time_created = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(thietlap.tl_time_created) == "0000-00-00"){
                    tl_time_created = new Date('1970-01-01T00:00:00.000+00:00')
                };
                
                
                let newobj = new TinhluongThietLap({
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
                    tl_kpi_no,
                    tl_time_created
                }) ;
                await newobj.save();
                console.log('insert thành công')
            }
        };
        console.log('Ket thuc')
    }
    catch(e){
        console.log(e,'TinhluongDetail')
    }
}

TakeDataContract();
TakeTinhluongThietLap();
TakeTinhluongWelfareShift();
TakeTinhluongRose();
TakeTinhluongPercentGr();
TakeTinhluongListClass();
TakeTinhluongPhatMuon();
TakeTinhluongPhatCa();
TakeTinhluongPayment();
TakeTinhluongListRose();
TakeTinhluongListNghiPhep();
TakeTinhluongListGroup();
TakeTinhluongGroup();
TakeTinhluongHoliday();
TakeDataTinhluong365EmpStart();
TakeTinhluong365SalaryBasic();
TakeTinhluong365ThuongPhat();
TakeTinhluong365DataClass();
TakeTinhluongDetailPayment();
TakeTinhluongDonate();
TakeTinhluongFamily();
TakeTinhluongForm();
TakeTinhluongFormSalary()
