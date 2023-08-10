const axios = require('axios');
const CC365_TimeSheet = require('./models/Chamcong/CC365_TimeSheet');
const CC365_Cycle = require('./models/Chamcong/CC365_Cycle');
const CC365_EmployeCycle = require('./models/Chamcong/CC365_EmployeCycle');
const Shift = require('./models/Chamcong/Shifts');
const CC365_CompanyWorkday = require('./models/Chamcong/CC365_CompanyWorkday');

let TakeDataTimeSheet = async()=>{
    try{
        console.log('Bắt đấu')
        let count = 0;
        let flag = true;
        while(flag){
            let response = await axios({
                method: "post",
                url: "http://43.239.223.85:9001/api/excute/sql",
                data: {
                    content:`SELECT * FROM time_sheets  LIMIT 10 OFFSET ${count}`
                },
                headers: { "Content-Type": "multipart/form-data" }
            });
            count = count + 10;
            if(response.data.data){
                if(response.data.data.length){
                    for(let i = 0; i < response.data.data.length; i++){
                        let timesheet = response.data.data[i];
                        await CC365_TimeSheet.deleteOne({sheet_id:Number(timesheet.sheet_id)})
                        let newobj = new CC365_TimeSheet(timesheet) ;
                        await newobj.save();
                        console.log('insert thành công',newobj)
                    }
                }
                else{
                    flag = false;
                }
            }
            else{
                console.log('Lỗi api')
                break;
            }
        };
        console.log('end')
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}
let TakeDataTimeSheetExtend = async()=>{
    try{
        let response = await axios({
            method: "post",
            url: "http://43.239.223.85:9001/api/excute/sql",
            data: {
                content:"SELECT * FROM time_sheets WHERE at_time > '2023-3-7 1:08:01' AND ep_id = 12483 AND at_time < '2023-5-7 23:08:01'"
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data.data){
            for(let i = 0; i < response.data.data.length; i++){
                let timesheet = response.data.data[i];
                await CC365_TimeSheet.deleteOne({sheet_id:Number(timesheet.sheet_id)})
                let newobj = new CC365_TimeSheet(timesheet) ;
                let newobj2 = await newobj.save();
                console.log('insert thành công',newobj2)
            }
        }
        else{
            console.log('Lỗi api')
        }
        console.log('end')
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}
let TakeDataCycle = async()=>{
    try{
        console.log('Bắt đầu')
        let response = await axios({
            method: "post",
            url: "http://43.239.223.85:9001/api/excute/sql",
            data: {
                content:`SELECT * FROM cycle`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data.data){
            for(let i = 0; i < response.data.data.length; i++){
                let cycle = response.data.data[i];
                let cy_id = Number(cycle.cy_id)||0;
                let com_id = Number(cycle.com_id)||0;
                let cy_name = Number(cycle.cy_name)||0;
                let apply_month;
                if(cycle.apply_month){
                    apply_month = new Date(cycle.apply_month);
                }
                else{
                    apply_month = new Date('1970-01-01T00:00:00.000+00:00');
                }
                if(String(cycle.apply_month) == "0000-00-00"){
                    apply_month = new Date('1970-01-01T00:00:00.000+00:00')
                };
                let cy_detail = String(cycle.cy_detail)||"";
                let status =String(cycle.status)||"";
                let is_personal = Number(cycle.is_personal)||0;
                
                await CC365_Cycle.deleteOne({cy_id:Number(cycle.cy_id)})
                let newobj = new CC365_Cycle({
                    cy_id,
                    com_id,
                    cy_name,
                    apply_month,
                    cy_detail,
                    status,
                    is_personal
                }) ;
                let newobj1 = await newobj.save();
                console.log('insert thành công',newobj1)
            }
        }
        console.log('end')
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}

let TakeDataCycleEm = async()=>{
    try{
        console.log('Bắt đầu')
        let response = await axios({
            method: "post",
            url: "http://43.239.223.85:9001/api/excute/sql",
            data: {
                content:`SELECT * FROM employee_cycle`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data.data){
            for(let i = 0; i < response.data.data.length; i++){
                let cyclem = response.data.data[i];
                await CC365_EmployeCycle.deleteOne({epcy_id:Number(cyclem.epcy_id)})
                let newobj = new CC365_EmployeCycle(cyclem) ;
                await newobj.save();
                console.log('insert thành công')
            }
        }
        console.log('end')
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}

let TakeDataShift = async()=>{
    try{
        console.log('Bắt đầu')
        let response = await axios({
            method: "post",
            url: "http://43.239.223.85:9001/api/excute/sql",
            data: {
                content:`SELECT * FROM shift WHERE com_id = 3312 ORDER BY shift_id DESC`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data.data){
            for(let i = 0; i < response.data.data.length; i++){
                let shift = response.data.data[i];
                await Shift.deleteOne({shift_id:Number(shift.shift_id)})
                let newobj = new Shift(shift) ;
                await newobj.save();
                console.log('insert thành công')
            }
        }
        console.log('end')
    }
    catch(e){
        console.log(e,'TakeDataShift')
    }
}

let TakeDataworkday = async()=>{
    try{
        console.log('Bắt đầu')
        let response = await axios({
            method: "post",
            url: "http://43.239.223.85:9001/api/excute/sql",
            data: {
                content:`SELECT * FROM company_workday`
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.data.data){
            for(let i = 0; i < response.data.data.length; i++){
                let workday = response.data.data[i];
                console.log(workday)
                await CC365_CompanyWorkday.deleteOne({cw_id:Number(workday.cw_id)})
                let newobj = new CC365_CompanyWorkday({
                    cw_id:Number(workday.cw_id),
                    com_id:Number(workday.com_id),
                    apply_month:String(workday.apply_month),
                    num_days:Number(workday.num_days)
                }) ;
                console.log(newobj);
                let newobj1 = await newobj.save();
                console.log(newobj1)
                console.log('insert thành công')
            }
        }
        console.log('end')
    }
    catch(e){
        console.log(e,'TakeDataShift')
    }
}
TakeDataworkday()
TakeDataCycleEm()
TakeDataCycle()
TakeDataTimeSheet()
TakeDataShift()
TakeDataTimeSheetExtend()