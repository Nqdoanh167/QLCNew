const Users = require('../../models/Users');
const Appoint = require('../../models/hr/personalChange/Appoint');
const QuitJobNew = require('../../models/hr/personalChange/QuitJobNew');
const TranferJob = require('../../models/hr/personalChange/TranferJob');
const functions = require('../../services/functions');
const RecruitmentNews = require('../../models/hr/RecruitmentNews')
const hr = require('../../services/hr/hrService');
const Candidates = require('../../models/hr/Candidates');
const GetJob = require('../../models/hr/GetJob');
const QuitJob = require('../../models/hr/personalChange/QuitJob');
const Salarys = require('../../models/hr/Salarys');
const Deparment = require('../../models/qlc/Deparment');
exports.report = async (req, res, next) => {
    try {
        // await Users.findByIdAndUpdate(20,{inForPerson:{account:{gender:2},employee:{com_id:20}}})
        // return
        // await Appoint.create({
        //     id:2,com_id:20,ep_id:16
        // })
        //return
        let comId = req.comId;
        let depId = req.body.depId || null;
        let from_date = req.body.from_date || null;
        let to_date = req.body.to_date || null;
        let chartNghiViec = req.body.nghiViec || null;
        let condition = {};
        if (depId) condition['inForPerson.employee.dep_id'] = depId;
        condition['inForPerson.employee.com_id'] = comId;
        let countEmployee = await Users.countDocuments(condition)
        condition['inForPerson.account.gender'] = 1;
        let countEmployeeNam = await Users.countDocuments(condition)
        condition['inForPerson.account.gender'] = 2;
        let countEmployeeNu = await Users.countDocuments(condition)
        if (from_date) condition.created_at = { $gte: new Date(from_date) }
        if (to_date) condition.created_at = { $lte: new Date(to_date) }
        if (from_date && to_date) condition.created_at = { $gte: new Date(from_date), $lte: new Date(to_date) }
        condition['inForPerson.account.gender'] = 1;
        let dataBoNhiemNam = await Users.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: 'HR_Appoints',
                    localField: 'idQLC',
                    foreignField: 'ep_id',
                    as: 'Appoints'
                }
            },
            {
                $count: 'SL'
            }
        ])
        condition['inForPerson.account.gender'] = 2;
        let dataBoNhiemNu = await Users.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: 'HR_Appoints',
                    localField: 'idQLC',
                    foreignField: 'ep_id',
                    as: 'Appoints'
                }
            },
            {
                $count: 'SL'
            }
        ])
        delete condition['inForPerson.account.gender']
        let dataBoNhiem = await Users.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: 'HR_Appoints',
                    localField: 'idQLC',
                    foreignField: 'ep_id',
                    as: 'Appoints'
                }
            },
            {
                $count: 'SL'
            }
        ])

        // Tỷ lệ nhân viên nghỉ việc

        delete condition['inForPerson.employee.com_id']
        condition.com_id = comId
        condition.type = 2
        let nghiViec = await QuitJob.countDocuments(condition)
        condition.type = 1
        let giamBienChe = await QuitJob.countDocuments(condition)
        let countDataNghiViec = giamBienChe + nghiViec;



        //  tang giam luong
        // await Salarys.create({
        //     id:5,idUser:8,comId:20,salaryBasic:200000,timeUp:'2023/06/30'
        // })
        delete condition.type
        delete condition.com_id

        let dataLuong = await Salarys.find({ comId }).sort({ timeUp: -1 });
        let tangLuong = 0;
        let giamLuong = 0;
        let arr = [];
        if (dataLuong.length !== 0) {
            for (let i = 0; i < dataLuong.length; i++) {
                condition.idUser = dataLuong[i].idUser;
                condition.timeUp = { $lt: dataLuong[i].timeUp }

                checkTangGiam = await Salarys.findOne(condition)
                console.log("🚀 ~ file: report.js:118 ~ exports.report= ~ checkTangGiam:", checkTangGiam)
                if (checkTangGiam && dataLuong[i].salaryBasic - checkTangGiam.salaryBasic > 0) {
                    tangLuong++;
                } else if (checkTangGiam && dataLuong[i].salaryBasic - checkTangGiam.salaryBasic < 0) {
                    giamLuong++;
                }
                if (checkTangGiam) {
                    let tangGiam = dataLuong[i].salaryBasic - checkTangGiam.salaryBasic
                    checkTangGiam.tangGiam = tangGiam
                    arr.push(checkTangGiam)
                }
            }
        }
        let tangGiamLuong = 0;
        if (tangLuong !== 0) tangGiamLuong = tangLuong;
        if (giamLuong !== 0) tangGiamLuong = giamLuong;
        if (tangLuong !== 0 && giamLuong !== 0) tangGiamLuong = tangLuong + giamLuong;

        delete condition.idUser
        delete condition.timeUp
        condition['inForPerson.employee.com_id'] = comId
        // Luân chuyển công tác
        let countDataLuanChuyen = await Users.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: 'HR_TranferJobs',
                    localField: 'idQLC',
                    foreignField: 'ep_id',
                    as: 'TranferJobs'
                }
            },
            {
                $count: 'SL'
            }
        ])
        condition['inForPerson.account.gender'] = 1
        let countDataLuanChuyenNam = await Users.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: 'HR_TranferJobs',
                    localField: 'idQLC',
                    foreignField: 'ep_id',
                    as: 'TranferJobs'
                }
            },
            {
                $count: 'SL'
            }
        ])
        condition['inForPerson.account.gender'] = 2
        let countDataLuanChuyenNu = await Users.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: 'HR_TranferJobs',
                    localField: 'idQLC',
                    foreignField: 'ep_id',
                    as: 'TranferJobs'
                }
            },
            {
                $count: 'SL'
            }
        ])
        //  Tổng số tin
        let tongSoTinTuyenDung = await RecruitmentNews.countDocuments({ isDelete: 0, comId })

        // // Tổng số hồ sơ
        let tongSoHoSo = await Candidates.countDocuments({ isDelete: 0, comId }, { id: 1 })

        // Tổng số ứng viên cần tuyển
        let tongSoUngVienCanTuyen = await RecruitmentNews.aggregate([
            {
                $match: { isDelete: 0, comId }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$number" }
                }
            }
        ])
        // Số ứng viên đến phỏng vấn
        let tongSoUngVienDenPhongVan = await Candidates.aggregate([
            {
                $lookup: {
                    from: 'HR_ScheduleInterviews',
                    localField: 'id',
                    foreignField: 'canId',
                    as: 'lichPv'
                }
            },
            {
                $match: { comId, 'lichPv.isSwitch': 0 }
            },
            {
                $count: 'SL'
            }
        ])
        // Số ứng viên qua phỏng vấn
        let tongSoUngVienQuaPhongVan = await Candidates.aggregate([
            {
                $lookup: {
                    from: 'HR_GetJobs',
                    localField: 'id',
                    foreignField: 'canId',
                    as: 'getJob'
                }
            },
            {
                $match: { comId, 'getJob.isSwitch': 0 }
            },
            {
                $count: 'SL'
            }
        ])
        // Số ứng viên nhận việc, thử việc
        let tongSoUngVienHuyNhanViec = await Candidates.aggregate([
            {
                $lookup: {
                    from: 'HR_CancelJobs',
                    localField: 'id',
                    foreignField: 'canId',
                    as: 'CancelJobs'
                }
            },
            {
                $match: { comId, 'CancelJobs.isSwitch': 0, isDelete: 0 }
            },
            {
                $count: 'SL'
            }
        ])
        // Báo cáo chi tiết theo tin tuyển dụng
        let query = await RecruitmentNews.find({ comId });
        let mangThongTin = [];
        if (query.length !== 0) {
            for (let i = 0; i < query.length; i++) {
                let tongSoUngVien = await Candidates.countDocuments({ comId, recruitmentNewsId: query[i].id })
                let tongSoUngVienDenPhongVan = await Candidates.aggregate([
                    {
                        $lookup: {
                            from: 'HR_ScheduleInterviews',
                            localField: 'id',
                            foreignField: 'canId',
                            as: 'lichPv'
                        }
                    },
                    {
                        $match: { comId, 'lichPv.isSwitch': 0, recruitmentNewsId: query[i].id }
                    },
                    {
                        $count: 'SL'
                    }
                ])
                let tongSoUngVienNhanViec = await Candidates.aggregate([
                    {
                        $lookup: {
                            from: 'HR_GetJobs',
                            localField: 'id',
                            foreignField: 'canId',
                            as: 'getJob'
                        }
                    },
                    {
                        $match: { comId, 'getJob.isSwitch': 0, recruitmentNewsId: query[i].id }
                    },
                    {
                        $count: 'SL'
                    }
                ])
                let tongSoUngVienHuy = await Candidates.aggregate([
                    {
                        $lookup: {
                            from: 'HR_CancelJobs',
                            localField: 'id',
                            foreignField: 'canId',
                            as: 'CancelJobs'
                        }
                    },
                    {
                        $match: { comId, 'CancelJobs.isSwitch': 0, isDelete: 0, recruitmentNewsId: query[i].id }
                    },
                    {
                        $count: 'SL'
                    }
                ])
                let thongTin = {};
                thongTin.id = query[i].id;
                thongTin.tongSoUngVien = tongSoUngVien;
                if (tongSoUngVienDenPhongVan.length !== 0) {
                    thongTin.tongSoUngVienDenPhongVan = tongSoUngVienDenPhongVan[0].SL;
                } else {
                    thongTin.tongSoUngVienDenPhongVan = 0
                }
                if (tongSoUngVienNhanViec.length !== 0) {
                    thongTin.tongSoUngVienNhanViec = tongSoUngVienNhanViec[0].SL;
                } else {
                    thongTin.tongSoUngVienNhanViec = 0
                }
                if (tongSoUngVienHuy.length !== 0) {
                    thongTin.tongSoUngVienHuy = tongSoUngVienHuy[0].SL;
                } else {
                    thongTin.tongSoUngVienHuy = 0
                }
                mangThongTin.push(thongTin)
            }
        }
        // Thống kê xếp hạng nhân viên tuyển dụng
        let thongKeNhanVienTuyenDung = await RecruitmentNews.aggregate([
            {
                $match: { comId }
            },
            {
                $group: {
                    _id: "$hrName",
                    total: { $sum: 1 },
                }
            },
        ])
        if (thongKeNhanVienTuyenDung.length !== 0) {
            for (let i = 0; i < thongKeNhanVienTuyenDung.length; i++) {
                let nameHr = await Users.findOne({ 'inForPerson.employee.com_id': comId, 'idQLC': thongKeNhanVienTuyenDung[i]._id }, { userName: 1 })
                if (nameHr)
                    thongKeNhanVienTuyenDung[i].nameHr = nameHr.userName;
            }
        }

        //Báo cáo chi tiết theo nhân viên giới thiệu ứng viên và tiền thưởng trực tiếp
        let gioiThieuUngVien = await Candidates.aggregate([
            {
                $match: { comId }
            },
            {
                $group: {
                    _id: "$userRecommend",
                    total: { $sum: 1 },
                }
            },
        ])
        if (gioiThieuUngVien.length !== 0) {
            for (let i = 0; i < gioiThieuUngVien.length; i++) {
                let nameHr = await Users.findOne({ 'inForPerson.employee.com_id': comId, 'idQLC': gioiThieuUngVien[i]._id }, { userName: 1, })
                if (nameHr)
                    gioiThieuUngVien[i].nameHr = nameHr.userName;

            }
        }
        let phongBan = await Deparment.find({ com_id: comId }, { _id: 1, deparmentName: 1 })
        condition['inForPerson.employee.com_id'] = comId;
        let searchItem = { idQLC: 1, userName: 1, 'inForPerson.account': 1, emailContact: 1, phone: 1, 'inForPerson.employee': 1, };
        let chartEmployee = await Users.find(condition, searchItem);
        delete condition['inForPerson.account.gender']
        let conditionNghiViec = {}
        if (chartNghiViec) {
            conditionNghiViec['quit.type'] = chartNghiViec
        }
        let chartNghiViecnon = await Users.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: 'HR_QuitJobs',
                    localField: 'idQLC',
                    foreignField: 'ep_id',
                    as: 'quit'
                }
            },
            {
                $match: conditionNghiViec
            },
            {
                $project: { 'quit.ep_id': 1, 'quit.current_position': 1, 'quit.created_at': 1, idQLC: 1, userName: 1, 'inForPerson.account': 1, emailContact: 1, phone: 1, 'inForPerson.employee': 1 }
            },
        ])
        console.log(condition)
        //Biểu đồ thống kê bổ nhiệm, quy hoạch
        let chartBoNhiem = await Users.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: 'HR_Appoints',
                    localField: 'idQLC',
                    foreignField: 'ep_id',
                    as: 'Appoints'
                }
            },
            {
                $project: searchItem
            }
        ])

        let chartLuanChuyen = await Users.aggregate([
            {
                $lookup: {
                    from: 'HR_TranferJobs',
                    localField: 'inForPerson.employee.com_id',
                    foreignField: 'com_id',
                    as: 'TranferJobs'
                }
            },
            {
                $match: condition
            },
            {
                $project: searchItem
            }
        ])
        let data = {};
        data.phongBan = phongBan;
        data.Employee = countEmployee;
        data.EmployeeNam = countEmployeeNam;
        data.EmployeeNu = countEmployeeNu;
        data.tongSoNghiViec = countDataNghiViec;
        data.giamBienChe = giamBienChe;
        data.nghiViec = nghiViec;
        if (dataBoNhiem.length !== 0) {
            data.boNhiem = dataBoNhiem[0].SL;
        } else {
            data.boNhiem = 0;
        }
        if (dataBoNhiemNam.length !== 0) {
            data.boNhiemNam = dataBoNhiemNam[0].SL;
        } else {
            data.boNhiemNam = 0
        }
        if (dataBoNhiemNu.length !== 0) {
            data.boNhiemNu = dataBoNhiemNu[0].SL;
        } else {
            data.boNhiemNu = 0
        }


        data.tangGiamLuong = tangGiamLuong;
        data.tangLuong = tangLuong;
        data.giamLuong = giamLuong;

        data.luanChuyen = countDataLuanChuyen;
        data.luanChuyenNam = countDataLuanChuyenNam;
        data.luanChuyenNu = countDataLuanChuyenNu;

        if (countDataLuanChuyen.length !== 0) {
            data.luanChuyen = countDataLuanChuyen[0].SL;
        } else {
            data.luanChuyen = 0;
        }
        if (countDataLuanChuyenNam.length !== 0) {
            data.luanChuyenNam = countDataLuanChuyenNam[0].SL;
        } else {
            data.luanChuyenNam = 0
        }
        if (countDataLuanChuyenNu.length !== 0) {
            data.luanChuyenNu = countDataLuanChuyenNu[0].SL;
        } else {
            data.luanChuyenNu = 0
        }

        data.tongSoTinTuyenDung = tongSoTinTuyenDung;
        data.tongSoHoSo = tongSoHoSo;
        if (tongSoUngVienCanTuyen.length !== 0) {
            data.tongSoUngVienCanTuyen = tongSoUngVienCanTuyen[0].total;
        } else {
            data.tongSoUngVienCanTuyen = 0
        }

        if (tongSoUngVienDenPhongVan.length !== 0) {
            data.tongSoUngVienDenPhongVan = tongSoUngVienDenPhongVan[0].SL;
        } else {
            data.tongSoUngVienDenPhongVan = 0
        }
        if (tongSoUngVienQuaPhongVan.length !== 0) {
            data.tongSoUngVienQuaPhongVan = tongSoUngVienQuaPhongVan[0].SL;
        } else {
            data.tongSoUngVienQuaPhongVan = 0
        }
        if (tongSoUngVienHuyNhanViec.length !== 0) {
            data.tongSoUngVienHuyNhanViec = tongSoUngVienHuyNhanViec[0].SL;
        } else {
            data.tongSoUngVienHuyNhanViec = 0
        }
        data.mangThongTin = mangThongTin;
        data.thongKeNhanVienTuyenDung = thongKeNhanVienTuyenDung;
        data.gioiThieuUngVien = gioiThieuUngVien;


        data.chartEmployee = chartEmployee;
        data.chartNghiViec = chartNghiViecnon;
        data.chartBoNhiem = chartBoNhiem;
        data.chartLuanChuyen = chartLuanChuyen;
        data.chartTangGiamLuong = arr;
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.log("🚀 ~ file: report.js:147 ~ exports.report= ~ error:", error)
        return functions.setError(res, error)
    }
}
exports.reportChart = async (req, res, next) => {
    try {
        let comId = req.comId;
        let depId = req.body.depId || null;
        let page = req.body.page || 1;
        let link = req.body.link;
        let gender = Number (req.body.gender);
        let positionId =Number (req.body.positionId);
        let groupId = Number(req.body.group_id);
        let teamId = Number(req.body.team_id);
        let birhday = req.body.birhday;
        let married = Number (req.body.married);
        let seniority = Number (req.body.seniority);
        let old = Number (req.body.old);


        let limit = 10;
        let skip = (page - 1) * limit;
        let searchItem = { idQLC: 1, userName: 1, 'inForPerson.account': 1, emailContact: 1, phone: 1, 'inForPerson.employee': 1, };
        let condition = {};
        let data = {};


        condition['inForPerson.employee.com_id'] = comId;
        if (gender) condition['inForPerson.account.gender'] = gender;
        if (depId) condition['inForPerson.employee.dep_id'] = depId;
        if (positionId) condition['inForPerson.employee.position_id'] = positionId;
        if (groupId) condition['inForPerson.employee.group_id'] = groupId;
        if (teamId) condition['inForPerson.employee.team_id'] = teamId;
        if (birhday) condition['inForPerson.account.birthday'] = { $regex: `.*${birhday}*.` };
        if (married) condition['inForPerson.account.married'] = married;
        if (depId) condition['inForPerson.employee.dep_id'] = depId;
        if (seniority) condition['inForPerson.account.experience'] = seniority;

        //if(old === 1) condition['inForPerson.account.birthday'] = getYear() - inForPerson.account.birthday;
        

        if (link === 'bieu-do-danh-sach-nhan-vien.html') {
            data = await Users.find(condition, searchItem, { skip }, { limit });
        } else if (link === 'bieu-do-danh-sach-nhan-vien-nghi-viec.html') {

            data = await Users.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup: {
                        from: 'HR_QuitJobs',
                        localField: 'idQLC',
                        foreignField: 'ep_id',
                        as: 'HR_QuitJobs'
                    }
                },
                {
                    $project: searchItem
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ])
        } else if (link === 'bieu-do-danh-sach-nhan-vien-bo-nhiem.html') {
            data = await Users.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup: {
                        from: 'HR_Appoints',
                        localField: 'idQLC',
                        foreignField: 'ep_id',
                        as: 'HR_Appoints'
                    }
                },
                {
                    $project: searchItem
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ])
        } else if (link === 'bieu-do-danh-sach-nhan-vien-chuyen-cong-tac.html') {
            data = await Users.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup: {
                        from: 'HR_TranferJobs',
                        localField: 'idQLC',
                        foreignField: 'ep_id',
                        as: 'HR_TranferJobs'
                    }
                },
                {
                    $project: searchItem
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ])
        } else if (link === 'bieu-do-danh-sach-nhan-vien-tang-giam-luong.html') {
            data = await Users.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup: {
                        from: 'HR_Salarys',
                        localField: 'idQLC',
                        foreignField: 'idUser',
                        as: 'HR_Salarys'
                    }
                },
                {
                    $project: searchItem
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ])
        } 
        else if (link === 'bieu-do-danh-sach-nhan-vien-theo-tham-nien-cong-tac.html') {
            let tuoi = 0;
            let list =[];
            console.log("🚀 ~ file: report.js:665 ~ exports.reportChart= ~ condition:", condition)

            let check = await Users.aggregate([
                {
                    $match: condition
                },
                {
                    $project: searchItem
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ])
            // await Users.findByIdAndUpdate(20,{'inForPerson.account.birthday':'2008/06/22'})
            for (let i = 0; i < check.length; i++) {
                let sinhnhat =  new Date(check[i].inForPerson.account.birthday).getFullYear()
                let namhientai = new Date().getFullYear();
                tuoi = namhientai - sinhnhat;
                console.log("🚀 ~ file: report.js:683 ~ exports.reportChart= ~ tuoi:", tuoi)
                if(old === 1 && tuoi < 30)
                {
                    list.push(check[i])
                }else if(old === 2 && tuoi > 30 && tuoi < 44)
                {
                    list.push(check[i])
                }else if(old === 3 && tuoi > 45 && tuoi < 59)
                {
                    list.push(check[i])
                }else if(old === 4 && tuoi > 60)
                {
                    list.push(check[i])
                }
            }
            data = list
        }
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        return functions.setError(error)
    }
}