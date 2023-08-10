const fnc = require("../../services/functions")
const settingIP = require("../../models/qlc/settingIP")
const Deparment = require("../../models/qlc/Deparment")
const Group = require("../../models/qlc/Group")
const CheckDevice = require("../../models/qlc/CheckDevice")
const HisTracking = require("../../models/qlc/HisTracking")
const Shifts = require("../../models/qlc/Shifts")
const ReportError = require("../../models/qlc/ReportError")
const Feedback = require("../../models/qlc/Feedback")
const CalendarWorkEmployee = require("../../models/qlc/CalendarWorkEmployee")
const Company = require("../../models/Users")

const axios = require('axios');
const FormData = require('form-data');
//pb: // 0: access_ip; 1: advisory; 2: appoint; 3: authentication; 4: check_qmk; 5: company;
// 6: company_coordinate; 7: company_web_ip; 8: company_wifi; 9: company_workday; 10: cycle; 11: delete_data_history; 12: department;
// 13: employee; 14: employee_cycle; 15: employee_device; 16: employee_history; 17: feedback_customer; 18: firebase_token; 19: groups;
// 20: log_access; 21: log_login; 22: notify_app; 23: permission; 24: question; 25: quit_job; 26: refresh_token; 27: report_error; 28: resign; 29: roles
//  30: send_notification; 31: shift; 32: time_sheets; 33: tranfer_job; 34:


//cài đặt IP
exports.toolsettingIP = async(req, res, next) => {

            try {
                let page = 1;
                let result = true;
                do {
                    let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 0 })
                    let data = listItems.data.items;
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    const html = JSON.stringify(element.html);
                    let updateAt = element.update_time;
                    if (updateAt == 0) {
                        updateAt = null;
                    };
                    const setIP = new settingIP({
                        _id: element.id_acc,
                        companyID: element.id_com,
                        accessIP: element.ip_access,
                        fromSite: element.from_site,
                        createAt: element.created_time,
                        updateAt ,
                    })
                    await setIP.save().then().error(err => {
                        console.log(err);
                    });
                }
                page++;
            } else {
                result = false;
            }
            console.log(page)
        } while (result);
        return fnc.success(res, 'Thành công')
    } catch (error) {
        console.log(error);
        return fnc.setError(res, error.message);
    }
}
//phòng ban
exports.toolDeparment = async(req, res, next) => {

            try {
                let page = 1;
                let result = true;
                do {
                    let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 12 })
                    let data = listItems.data.items;
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    // const html = JSON.stringify(element.html);
                    // let deparmentOrder = element.dep_order;
                    // if (deparmentOrder == 0) {
                    //     deparmentOrder = null;
                    // };
                    const department = new Deparment({
                        _id: element.dep_id,
                        companyID: element.com_id,
                        deparmentName: element.dep_name,
                        managerId: element.manager_id,
                        deparmentCreated: element.dep_create_time,
                        deparmentOrder,
                    })
                    await department.save();
                }
                page++;
            } else {
                result = false;
            }
            console.log(page)
        } while (result);
        return fnc.success(res, 'Thành công')
    } catch (error) {
        console.log(error);
        return fnc.setError(res, error.message);
    }
}
//nhóm
exports.toolGroup = async(req, res, next) => {

            try {
                let page = 1;
                let result = true;
                do {
                    let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 19 })
                    let data = listItems.data.items;
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    // const html = JSON.stringify(element.html);
                    // let deparmentOrder = element.dep_order;
                    // if (deparmentOrder == 0) {
                    //     deparmentOrder = null;
                    // };
                    const Groups = new Group({
                        _id: element.gr_id,
                        companyID: element.dep_id,
                        groupName: element.gr_name,
                        parentGroup: element.parent_gr,
                    })
                    await Groups.save();
                }
                page++;
            } else {
                result = false;
            }
            console.log(page)
        } while (result);
        return fnc.success(res, 'Thành công')
    } catch (error) {
        console.log(error);
        return fnc.setError(res, error.message);
    }
}
//tài khoản cty
exports.toolCompany = async(req, res, next) => {

            try {
                let page = 1;
                let result = true;
                do {
                    let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 5 })
                    let data = listItems.data.items;
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    // const html = JSON.stringify(element.html);
                    // let com_id_tv365 = element.com_id_tv365;
                    // if (com_id_tv365 == 0) {
                    //     com_id_tv365 = null;
                    // };
                    // let com_quantity_time = element.com_quantity_time;
                    // if (com_quantity_time == 0) {
                    //     com_quantity_time = null;
                    // };
                    const company = new Company({
                        _id: element.com_id,
                        "inForPerson.companyID": element.com_parent_id,
                        userName: element.com_name,
                        email: element.com_email,
                        phoneTK: element.com_phone_tk,
                        "inForCompany.type_timekeeping": element.type_timekeeping,
                        "inForCompany.id_way_timekeeping": element.id_way_timekeeping,
                        password: element.com_pass,
                        "inForCompany.comMd5": element.com_pass_encrypt,
                        phone: element.com_phone,
                        "inForCompany.com_email_lh": element.com_email_lh,
                        avatarUser: element.com_logo,
                        address: element.com_address,
                        "inForCompany.com_role_id": element.com_role_id,
                        "inForCompany.com_size": element.com_size,
                        "inForPerson.description": element.com_description,
                        createdAt: element.com_create_time,
                        updatedAt: element.com_update_time,
                        authentic: element.com_authentic,
                        latitude: element.com_lat,
                        longtitude: element.com_lng,
                        "inForCompany.com_path": element.com_path,
                        "inForCompany.base36_path": element.base36_path,
                        "inForCompany.com_qr_logo": element.com_qr_logo,
                        "inForCompany.enable_scan_qr": element.enable_scan_qr,
                        fromWeb: element.from_source,
                        "inForCompany.com_vip":element.com_vip,
                        "inForCompany.com_ep_vip": element.com_ep_vip,
                        "inForCompany.com_id_tv365":element.com_id_tv365 ,
                        "inForCompany.com_quantity_time":element.com_quantity_time,
                        "inForCompany.ep_crm": element.ep_crm,
                        "inForCompany.idKD": element.com_kd,
                        
                        
                    })
                    console.log(company)
                    await company.save()
                }
                page++;
            } else {
                result = false;
            }
            console.log(page)
        } while (result);
        return fnc.success(res, 'Thành công')
    } catch (error) {
        console.log(error);
        return fnc.setError(res, error.message);
    }
}


//lịch làm việc của nhân viên
exports.toolCalendarWorkEmployee = async(req, res, next) => {

    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 15 })
            let data = listItems.data.items;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // const html = JSON.stringify(element.html);
            // let deparmentOrder = element.dep_order;
            // if (deparmentOrder == 0) {
            //     deparmentOrder = null;
            // };
            const calendar = new CalendarWorkEmployee({
                _id: element.cy_id,
                companyID: element.com_id,
                calendarName: element.cy_name,
                timeApply: element.apply_month,
                Detail: element.cy_detail,
                Status: element.status,
                isPersonal: element.is_personal,
                // deparmentOrder,
            })
            await calendar.save();
        }
        page++;
    } else {
        result = false;
    }
    console.log(page)
} while (result);
return fnc.success(res, 'Thành công')
} catch (error) {
console.log(error);
return fnc.setError(res, error.message);
}
}
//lịch làm việc của nhân viên
exports.toolCalendarWorkEmployee = async(req, res, next) => {

    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 10 })
            let data = listItems.data.items;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // // const html = JSON.stringify(element.html);
            // let deparmentOrder = element.dep_order;
            // if (deparmentOrder == 0) {
            //     deparmentOrder = null;
            // };
            const calendar = new CalendarWorkEmployee({
                _id: element.cy_id,
                companyID: element.com_id,
                calendarName: element.cy_name,
                timeApply: element.apply_month,
                Detail: element.cy_detail,
                Status: element.status,
                isPersonal: element.is_personal,
                // deparmentOrder,
            })
            await calendar.save();
        }
        page++;
    } else {
        result = false;
    }
    console.log(page)
} while (result);
return fnc.success(res, 'Thành công')
} catch (error) {
console.log(error);
return fnc.setError(res, error.message);
}
}
//duyệt thiết bị 
exports.toolCheckDevice = async(req, res, next) => {

    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 15 })
            let data = listItems.data.items;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // const html = JSON.stringify(element.html);
            // let deparmentOrder = element.dep_order;
            // if (deparmentOrder == 0) {
            //     deparmentOrder = null;
            // };
            const device = new CheckDevice({
                _id: element.ed_id,
                idQLC: element.ep_id,
                curDeviceId: element.current_device,
                curDeviceName: element.current_device_name,
                newDeviceId: element.new_device,
                newDeviceName: element.new_device_name,
                createdAt: element.create_time,
                typeDevice: element.type_device,
                // deparmentOrder,
            })
            await device.save();
        }
        page++;
    } else {
        result = false;
    }
    console.log(page)
} while (result);
return fnc.success(res, 'Thành công')
} catch (error) {
console.log(error);
return fnc.setError(res, error.message);
}
}

//bao cao loi
exports.toolReportError = async(req, res, next) => {

    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 15 })
            let data = listItems.data.items;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // const html = JSON.stringify(element.html);
            // let deparmentOrder = element.dep_order;
            // if (deparmentOrder == 0) {
            //     deparmentOrder = null;
            // };
            const Report = new ReportError({
                _id: element.ed_id,
                idQLC: element.ep_id,
                curDeviceId: element.current_device,
                curDeviceName: element.current_device_name,
                newDeviceId: element.new_device,
                newDeviceName: element.new_device_name,
                createdAt: element.create_time,
                typeDevice: element.type_device,
                // deparmentOrder,
            })
            await Report.save();
        }
        page++;
    } else {
        result = false;
    }
    console.log(page)
} while (result);
return fnc.success(res, 'Thành công')
} catch (error) {
console.log(error);
return fnc.setError(res, error.message);
}
}

// danh gia
exports.toolFeedback = async(req, res, next) => {

    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 17 })
            let data = listItems.data.items;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // const html = JSON.stringify(element.html);
            // let deparmentOrder = element.dep_order;
            // if (deparmentOrder == 0) {
            //     deparmentOrder = null;
            // };
            const Feedbacks = new Feedback({
                _id: element.id,
                idQLC: element.id_user,
                type: element.type_user,
                feed_back: element.feed_back,
                rating: element.rating,
                app_name: element.app_name,
                createdAt: element.create_date,
                from_source: element.from_source,
                // deparmentOrder,
            })
            await Feedbacks.save();
        }
        page++;
    } else {
        result = false;
    }
    console.log(page)
} while (result);
return fnc.success(res, 'Thành công')
} catch (error) {
console.log(error);
return fnc.setError(res, error.message);
}
}
//ca làm việc
exports.toolShifts = async(req, res, next) => {

    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 31 })
            let data = listItems.data.items;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // const html = JSON.stringify(element.html);
            // let deparmentOrder = element.dep_order;
            // if (deparmentOrder == 0) {
            //     deparmentOrder = null;
            // };
            const Shift = new Shifts({
                _id: element.shift_id,
                companyID: element.com_id,
                createdAt: element.create_time,
                shiftName: element.shift_name,
                timeCheckIn: element.start_time,
                timeCheckOut: element.end_time,
                timeCheckInEarliest: element.end_time_earliest,
                timeCheckOutLastest: element.start_time_latest,
                idTypeCalculateWork: element.shift_type,
                numOfWorkPerShift: element.num_to_calculate,
                money: element.num_to_money,
                over_night: element.over_night,
                is_overtime: element.is_overtime,
                status: element.status,
                // deparmentOrder,
            })
            await Shift.save();
        }
        page++;
    } else {
        result = false;
    }
    console.log(page)
} while (result);
return fnc.success(res, 'Thành công')
} catch (error) {
console.log(error);
return fnc.setError(res, error.message);
}
}


//lịch sử chấm công
exports.toolHisTracking = async(req, res, next) => {

    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await fnc.getDataAxios('https://chamcong.24hpay.vn/api_list_data/api_all.php', { page: page, pb: 32 })
            let data = listItems.data.items;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // const html = JSON.stringify(element.html);
            // let deparmentOrder = element.dep_order;
            // if (deparmentOrder == 0) {
            //     deparmentOrder = null;
            // };
            const tracking = new HisTracking({
                _id: element.sheet_id,
                idQLC: element.ep_id,
                imageTrack: element.ts_image,
                CreateAt: element.at_time,
                curDeviceName: element.device,
                latitude: element.ts_lat,
                longtitude: element.ts_long,
                Location: element.ts_location_name,
                NameWifi: element.wifi_name,
                IpWifi: element.wifi_ip,
                MacWifi: element.wifi_mac,
                shiftID: element.shift_id,
                companyID: element.ts_com_id,
                Note: element.note,
                BluetoothAdrr: element.bluetooth_address,
                status: element.status,
                Err: element.ts_error,
                Success: element.is_success,
                // deparmentOrder,
            })
            await tracking.save();
        }
        page++;
    } else {
        result = false;
    }
    console.log(page)
} while (result);
return fnc.success(res, 'Thành công')
} catch (error) {
console.log(error);
return fnc.setError(res, error.message);
}
}
