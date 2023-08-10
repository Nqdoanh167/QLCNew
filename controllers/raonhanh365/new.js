const functions = require("../../services/functions");
const Category = require("../../models/Raonhanh365/Category");
const New = require("../../models/Raonhanh365/New");
const CategoryRaoNhanh365 = require("../../models/Raonhanh365/Category");
const User = require("../../models/Users");
const RN365_AdminUser = require('../../models/Raonhanh365/Admin/AdminUser')
const LoveNews = require("../../models/Raonhanh365/LoveNews");
const Bidding = require("../../models/Raonhanh365/Bidding");
const LikeRN = require("../../models/Raonhanh365/Like");
const ApplyNewsRN = require("../../models/Raonhanh365/ApplyNews");
const raoNhanh = require("../../services/rao nhanh/raoNhanh");
const Comments = require("../../models/Raonhanh365/Comments");
const Evaluate = require("../../models/Raonhanh365/Evaluate");

const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Users = require("../../models/Users");
const ApplyNews = require("../../models/Raonhanh365/ApplyNews");
const AdminUser = require("../../models/Raonhanh365/Admin/AdminUser");
dotenv.config();
// đăng tin
exports.postNewMain = async(req, res, next) => {
    try {
        let img = req.files.img;
        let video = req.files.video;
        let listImg = [];
        let nameVideo = "";
        let userID = req.user.data.idRaoNhanh365;
        console.log("🚀 ~ file: new.js:28 ~ exports.postNewMain= ~ userID:", userID)
        let request = req.body;
        cateID = request.cateID,
            title = request.title,
            money = request.money,
            until = request.until,
            description = request.description,
            free = request.free,
            poster = request.poster,
            name = request.name,
            email = request.email,
            address = request.address,
            phone = request.phone,
            status = 0,
            detailCategory = request.detailCategory,
            buySell = 2,
            productType = request.productType,
            productGroup = request.productGroup,
            city = request.city,
            district = request.district,
            ward = request.ward,
            brand = request.brand;
        let fields = [
            userID,
            cateID,
            title,
            money,
            until,
            description,
            free,
            poster,
            name,
            email,
            address,
            phone,
            status,
            detailCategory,
        ];


        // for (let i = 0; i < fields.length; i++) {
        //     if (!fields[i])
        //         return functions.setError(res, "Missing input value", 404);
        // }
        const maxIDNews = await New.findOne({}, { _id: 1 })
            .sort({ _id: -1 })
            .limit(1)
            .lean();
        let newIDNews;
        if (maxIDNews) {
            newIDNews = Number(maxIDNews._id) + 1;
        } else newIDNews = 1;


        if (video) {
            if (video.length == 1) {
                let checkVideo = await functions.checkVideo(video[0]);
                if (checkVideo) {
                    nameVideo = video[0].filename;
                } else {
                    video.forEach(async(element) => {
                        await functions.deleteImg(element);
                    });
                    return functions.setError(
                        res,
                        "video không đúng định dạng hoặc lớn hơn 100MB ",
                        407
                    );
                }
            } else if (video.length > 1) {
                await functions.deleteImgVideo(img, video);
                return functions.setError(res, "chỉ được đưa lên 1 video", 408);
            }
        }
        req.info = {
            _id: newIDNews,
            userID: userID,
            cateID: cateID,
            title: title,
            money: money,
            until: until,
            description: description,
            free: free,
            poster: poster,
            name: name,
            status: status,
            email: email,
            address: address,
            phone: phone,
            detailCategory: detailCategory,
            district: district,
            img: img,
            video: video,
            productGroup: productGroup,
            productType: productType,
            city: city,
            district: district,
            ward: ward,
            brand: brand,
            buySell: 2, // tin ban
            active: 1, // hien thi tin
        };

        return next();

    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

// đăng tin chung cho tat ca cac tin
exports.postNewsGeneral = async(req, res, next) => {
    try {
        let exists = await Category.find({ _id: req.cateID });
        let fields = req.info;
        if (exists) {
            let request = req.body;

            //cac truong khi dang tin do dien tu
            let fieldsElectroniceDevice = {
                microprocessor: request.microprocessor,
                ram: request.ram,
                hardDrive: request.hardDrive,
                typeHardrive: request.typeHardrive,
                screen: request.screen,
                size: request.size,
                brand: request.brand,
                machineSeries: request.machineSeries,
                warranty: request.warranty,
                device: request.device,
                capacity: request.capacity,
                sdung_sim: request.sdung_sim,
                phien_ban: request.phien_ban,
            };

            //cac truong khi dang tin do xe co
            let fieldsVehicle = {
                hang: request.hang,
                loai_xe: request.loai_xe,
                xuat_xu: request.xuat_xu,
                mau_sac: request.mau_sac,
                kich_co: request.kich_co,
                chat_lieu_khung: request.chat_lieu_khung,
                baohanh: request.baohanh,
                dong_xe: request.dong_xe,
                nam_san_xuat: request.nam_san_xuat,
                dung_tich: request.dung_tich,
                td_bien_soxe: request.td_bien_soxe,
                phien_ban: request.phien_ban,
                hop_so: request.hop_so,
                nhien_lieu: request.nhien_lieu,
                kieu_dang: request.kieu_dang,
                so_cho: request.so_cho,
                trong_tai: request.trong_tai,
                loai_linhphu_kien: request.loai_linhphu_kien,
                so_km_da_di: request.so_km_da_di,
            };

            // cac truong khi dang tin bat dong san
            let fieldsRealEstate = {
                ten_toa_nha: request.ten_toa_nha,
                td_macanho: request.td_macanho,
                ten_phan_khu: request.ten_phan_khu,
                td_htmch_rt: request.td_htmch_rt,
                so_pngu: request.so_pngu,
                so_pve_sinh: request.so_pve_sinh,
                tong_so_tang: request.tong_so_tang,
                huong_chinh: request.huong_chinh,
                giay_to_phap_ly: request.giay_to_phap_ly,
                tinh_trang_noi_that: request.tinh_trang_noi_that,
                dac_diem: request.dac_diem,
                dien_tich: request.dien_tich,
                dientichsd: request.dientichsd,
                chieu_dai: request.chieu_dai,
                chieu_rong: request.chieu_rong,
                tinh_trang_bds: request.tinh_trang_bds,
                td_block_thap: request.td_block_thap,
                tang_so: request.tang_so,
                loai_hinh_canho: request.loai_hinh_canho,
                loaihinh_vp: request.loaihinh_vp,
                loai_hinh_dat: request.loai_hinh_dat,
                kv_thanhpho: request.kv_thanhpho,
                kv_thanhpho: request.kv_thanhpho,
                kv_quanhuyen: request.kv_quanhuyen,
                kv_phuongxa: request.kv_phuongxa,

            };
            // cac truong cua ship
            let fieldsShip = {
                product: request.product,
                timeStart: Date(request.timeStart),
                timeEnd: Date(request.timeEnd),
                allDay: request.allDay,
                vehicloType: request.vehicloType,
            };
            //cac truong cua danh muc thu cung
            let fieldsPet = {
                age: req.body.age,
                gender: req.body.gender,
                weigth: req.body.weigth,
            };

            let fieldsbeautifull = {
                loai_hinh_sp: req.body.loai_hinh_sp,
                loai_sanpham: req.body.loai_sanpham,
                han_su_dung: req.body.han_su_dung,
                hang_vattu: req.body.hang_vattu,

            };
            let fieldwareHouse = {
                loai_thiet_bi: req.body.loai_thiet_bi,
                hang: req.body.hang,
                cong_suat: req.body.cong_suat,
                dung_tich: req.body.dung_tich,
                khoiluong: req.body.khoiluong,
                loai_chung: req.body.loai_chung,
                loai_sanpham: req.body.loai_sanpham,

            };
            let cv = req.files.cv;
            let nameFileCV = "";
            if (cv) {
                if (await functions.checkFileCV(cv.path)) {
                    nameFileCV = cv.originalFilename;
                } else {
                    return functions.setError(
                        res,
                        "Vui lòng chọn file có định đạng: PDF",
                        506
                    );
                }
            }
            //cac truong cua danh muc cong viec
            let fieldsJob = {
                minAge: req.body.minAge,
                exp: req.body.exp,
                level: req.body.level,
                skill: req.body.skill,
                quantity: req.body.quantity,
                addressNumber: req.body.addressNumber,
                payBy: req.body.payBy,
                benefit: req.body.benefit,
                salary: req.body.salary,
                gender: req.body.gender,
                degree: req.body.degree,
                cv: nameFileCV,
            };
            let fieldsinfoSell = {
                    groupType: req.body.groupType,
                    classify: req.body.classify,
                    numberWarehouses: req.body.numberWarehouses,
                    promotionType: req.body.promotionType,
                    promotionValue: req.body.promotionValue,
                    transport: req.body.transport,
                    transportFee: req.body.transportFee,
                    productValue: req.body.productValue,
                    untilMoney: req.body.untilMoney,
                    untilTranpost: req.body.untilTranpost,
                    tgian_bd: req.body.tgian_bd,
                    tgian_kt: req.body.tgian_kt,
                    dia_chi: req.body.dia_chi,
                }
                //
            fields.electroniceDevice = fieldsElectroniceDevice;
            fields.vehicle = fieldsVehicle;
            fields.realEstate = fieldsRealEstate;
            fields.ship = fieldsShip;
            fields.pet = fieldsPet;
            fields.Job = fieldsJob;
            fields.beautifull = fieldsbeautifull;
            fields.wareHouse = fieldwareHouse;
            fields.infoSell = fieldsinfoSell
            req.fields = fields;
            return next();
        }
        return functions.setError(res, "Category not found!", 505);
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

exports.createNews = async(req, res, next) => {
    try {
        let fields = req.fields;
        let userID = req.user.data.idRaoNhanh365;
        console.log("🚀 ~ file: new.js:315 ~ exports.createNews= ~ userID:", userID)
        console.log("🚀 ~ file: new.js:314 ~ exports.createNews= ~ fields:", fields)

        let cate_Special = null;
        let danh_muc1 = null;
        let danh_muc2 = null;
        let danh_muc3 = null;
        let linkTitle = await raoNhanh.createLinkTilte(fields.title)
        fields.linkTitle = linkTitle
        cate1 = await CategoryRaoNhanh365.findById(fields.cateID);
        danh_muc1 = cate1.name;

        if (cate1.parentId !== 0) {
            cate2 = await CategoryRaoNhanh365.findById(cate1.parentId);
            danh_muc2 = cate2.name;
            if (cate2.parentId !== 0) {
                cate3 = await CategoryRaoNhanh365.findById(cate2.parentId);
                danh_muc3 = cate3.name;
            }
        }
        if (danh_muc3) {
            cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc3);
        } else {
            if (danh_muc2) {
                cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc2);
            } else {
                cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc1);
            }
        }
        let image = [];
        if (cate_Special && fields.img && fields.img.length > 1) {

            let folder = await raoNhanh.checkFolderCateRaoNhanh(cate_Special)
            for (let i = 0; i < fields.img.length; i++) {
                await raoNhanh.uploadFileRaoNhanh(folder, fields.userID, fields.img[i], ['.png', '.jpg'])
                let img = await raoNhanh.createLinkFileRaonhanh(folder, fields.userID, fields.img[i].name)
                image.push({
                    nameImg: img
                })
            }
            fields.img = image;
        } else if (cate_Special && fields.img) {
            let folder = await raoNhanh.checkFolderCateRaoNhanh(cate_Special)
            await raoNhanh.uploadFileRaoNhanh(folder, fields.userID, fields.img, ['.png', '.jpg'])
            let img = await raoNhanh.createLinkFileRaonhanh(folder, fields.userID, fields.img.name)
            image.push({
                nameImg: img
            })

            fields.img = image;
        }
        if (cate_Special && fields.video) {

            let folder = await raoNhanh.checkFolderCateRaoNhanh(cate_Special)
            let check = await raoNhanh.uploadFileRaoNhanh(folder, fields.userID, fields.video, ['.mp4', '.avi', '.wmv', '.mov'])
            if (check === false) return functions.setError(res, 'khong duoc day video dang nay', 400)
            let video = await raoNhanh.createLinkFileRaonhanh(folder, fields.userID, fields.video.name)

            fields.video = video;
        }

        fields.createTime = new Date(Date.now());

        const news = new New(fields);
        await news.save();
        return functions.success(res, "create news success");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

//chinh sua tat ca cac loai tin
exports.updateNews = async(req, res, next) => {
    try {
        let idNews = Number(req.body.news_id);

        if (!idNews) return functions.setError(res, "Missing input news_id!", 405);
        let existsNews = await New.find({ _id: idNews });
        let fields = req.fields;
        console.log("🚀 ~ file: new.js:398 ~ exports.updateNews= ~ fields:", fields)
        let userID = req.user.data.idRaoNhanh365;
        console.log("🚀 ~ file: new.js:399 ~ exports.updateNews= ~ userID:", userID)
        let linkTitle = await raoNhanh.createLinkTilte(fields.title)
        fields.linkTitle = linkTitle
        fields.updateTime = new Date(Date.now());
        let cate_Special = null;
        let danh_muc1 = null;
        let danh_muc2 = null;
        let danh_muc3 = null;
        cate1 = await CategoryRaoNhanh365.findById(fields.cateID);
        danh_muc1 = cate1.name;

        if (cate1.parentId !== 0) {
            cate2 = await CategoryRaoNhanh365.findById(cate1.parentId);
            danh_muc2 = cate2.name;
            if (cate2.parentId !== 0) {
                cate3 = await CategoryRaoNhanh365.findById(cate2.parentId);
                danh_muc3 = cate3.name;
            }
        }
        if (danh_muc3) {
            cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc3);
        } else {
            if (danh_muc2) {
                cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc2);
            } else {
                cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc1);
            }
        }
        let image = [];
        if (cate_Special && fields.img && fields.img.length > 1) {

            let folder = await raoNhanh.checkFolderCateRaoNhanh(cate_Special)
            for (let i = 0; i < fields.img.length; i++) {
                await raoNhanh.uploadFileRaoNhanh(folder, fields.userID, fields.img[i], ['.png', '.jpg'])
                let img = await raoNhanh.createLinkFileRaonhanh(folder, fields.userID, fields.img[i].name)
                image.push({
                    nameImg: img
                })
            }
            fields.img = image;
        } else if (cate_Special && fields.img) {
            console.log(fields.img)
            let folder = await raoNhanh.checkFolderCateRaoNhanh(cate_Special)
            await raoNhanh.uploadFileRaoNhanh(folder, fields.userID, fields.img, ['.png', '.jpg'])
            let img = await raoNhanh.createLinkFileRaonhanh(folder, fields.userID, fields.img.name)
            image.push({
                nameImg: img
            })

            fields.img = image;
        }
        if (cate_Special && fields.video) {

            let folder = await raoNhanh.checkFolderCateRaoNhanh(cate_Special)
            let check = await raoNhanh.uploadFileRaoNhanh(folder, fields.userID, fields.video, ['.mp4', '.avi', '.wmv', '.mov'])
            if (check === false) return functions.setError(res, 'khong duoc day video dang nay', 400)
            let video = await raoNhanh.createLinkFileRaonhanh(folder, fields.userID, fields.video.name)

            fields.video = video;
        }
        if (existsNews) {
            // xoa truong _id
            delete fields._id;
            await New.findByIdAndUpdate(idNews, fields);
            return functions.success(res, "News edited successfully");
        }
        return functions.setError(res, "News not found!", 505);
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

exports.hideNews = async(req, res, next) => {
    try {
        let idNews = Number(req.body.news_id);
        if (!idNews) return functions.setError(res, "Missing input news_id!", 405);
        let existsNews = await New.find({ _id: idNews });
        if (existsNews) {
            let active = 0;
            if (existsNews.active == 0) {
                active = 1;
            }
            await New.findByIdAndUpdate(idNews, {
                active: active,
                updateTime: new Date(Date.now()),
            });

            return functions.success(res, "Hide news successfully");
        }
        return functions.setError(res, "News not found!", 505);
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

exports.pinNews = async(req, res, next) => {
    try {
        let idNews = Number(req.body.news_id);
        if (!idNews) return functions.setError(res, "Missing input news_id!", 405);
        let {
            timeStartPinning,
            dayStartPinning,
            numberDayPinning,
            moneyPinning,
            pinHome,
            pinCate,
        } = req.body;
        let existsNews = await New.find({ _id: idNews });
        if (existsNews) {
            let now = new Date(Date.now());
            if (!timeStartPinning) timeStartPinning = now;
            if (!dayStartPinning) dayStartPinning = now;
            let fields = {
                timeStartPinning: timeStartPinning,
                dayStartPinning: dayStartPinning,
                numberDayPinning: numberDayPinning,
                moneyPinning: moneyPinning,
                pinHome: pinHome,
                pinCate: pinCate,
                updateTime: now,
            };
            await New.findByIdAndUpdate(idNews, fields);
            return functions.success(res, "Pin news successfully");
        }
        return functions.setError(res, "News not found!", 505);
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

exports.pushNews = async(req, res, next) => {
    try {
        let idNews = Number(req.body.news_id);
        if (!idNews) return functions.setError(res, "Missing input news_id!", 405);
        let {
            dayStartPinning,
            timeStartPinning,
            numberDayPinning,
            moneyPinning,
            timePinning,
            pinHome,
        } = req.body;
        let existsNews = await New.find({ _id: idNews });
        if (existsNews) {
            let now = new Date(Date.now());
            if (!timeStartPinning) timeStartPinning = now;
            if (!dayStartPinning) dayStartPinning = now;
            let fields = {
                timePinning: timePinning,
                moneyPinning: moneyPinning,
                numberDayPinning: numberDayPinning,
                timeStartPinning: timeStartPinning,
                dayStartPinning: dayStartPinning,
                pinHome: pinHome,
                updateTime: now,
            };
            await New.findByIdAndUpdate(idNews, fields);
            return functions.success(res, "Push news successfully");
        }
        return functions.setError(res, "News not found!", 505);
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

exports.searchSellNews = async(req, res, next) => {
    try {
        if (req.body) {
            if (!req.body.page) {
                return functions.setError(res, "Missing input page", 401);
            }
            if (!req.body.pageSize) {
                return functions.setError(res, "Missing input pageSize", 402);
            }
            let page = Number(req.body.page);
            let pageSize = Number(req.body.pageSize);
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            let idNews = req.body.idNews;
            let title = req.body.title;
            let description = req.body.description;
            let city = req.body.city;
            let district = req.body.district;
            let ward = req.body.ward;
            let listNews = [];
            let listCondition = {};
            let cateID = Number(req.body.cateID);
            let buySell = Number(req.body.buySell);

            // dua dieu kien vao ob listCondition
            if (idNews) listCondition._id = idNews;
            if (cateID) listCondition.cateID = cateID;
            if (buySell) listCondition.buySell = buySell;
            if (title) listCondition.title = new RegExp(title, "i");
            if (description) listCondition.description = new RegExp(description);
            if (city) listCondition.city = Number(city);
            if (district) listCondition.district = Number(district);
            if (ward) listCondition.ward = Number(ward);

            let fieldsGet = {
                userID: 1,
                title: 1,
                linkTitle: 1,
                money: 1,
                endvalue: 1,
                downPayment: 1,
                until: 1,
                cateID: 1,
                type: 1,
                image: 1,
                video: 1,
                buySell: 1,
                createTime: 1,
                updateTime: 1,
                city: 1,
                district: 1,
            };
            listNews = await functions.pageFindWithFields(
                New,
                listCondition,
                fieldsGet, { _id: 1 },
                skip,
                limit
            );
            totalCount = await New.countDocuments(listCondition);
            return functions.success(res, "get buy news success", {
                data: { totalCount, listNews },
            });
        } else {
            return functions.setError(res, "Missing input data", 400);
        }
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

// đăng tin do dien tu
exports.postNewElectron = async(req, res, next) => {
    try {
        let listID = [];
        let listCategory = await functions.getDatafind(Category, { parentId: 1 });
        for (let i = 0; i < listCategory.length; i++) {
            listID.push(listCategory[i]._id);
        }
        let fields = req.info;
        const exists = listID.includes(Number(fields.cateID));
        if (exists) {
            let request = req.body,
                microprocessor = request.microprocessor,
                ram = request.ram,
                hardDrive = request.hardDrive,
                typeHarđrive = request.typeHarđrive,
                screen = request.screen,
                size = request.size,
                brand = request.brand,
                machineSeries = request.machineSeries;
            let subFields = {
                microprocessor,
                ram,
                hardDrive,
                typeHarđrive,
                screen,
                size,
                brand,
                machineSeries,
            };
            fields.createTime = new Date(Date.now());
            fields.electroniceDevice = subFields;
            const news = new New(fields);
            await news.save();
            return functions.success(res, "create news electronic device success");
        }
        return functions.setError(
            res,
            "Category electronic device not found!",
            505
        );
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

// đăng tin
exports.postNewVehicle = async(req, res, next) => {
    try {
        let listID = [];
        let listCategory = await functions.getDatafind(Category, { parentId: 2 });
        for (let i = 0; i < listCategory.length; i++) {
            listID.push(listCategory[i]._id);
        }
        const exists = listID.includes(req.info.cateID);
        if (exists) {
            let request = req.body,
                brandMaterials = request.brandMaterials,
                vehicles = request.vehicles,
                spareParts = request.spareParts,
                interior = request.interior,
                device = request.device,
                color = request.color,
                capacity = request.capacity,
                connectInternet = request.connectInternet,
                generalType = request.generalType,
                wattage = request.wattage,
                resolution = request.resolution,
                engine = request.engine,
                accessary = request.accessary,
                frameMaterial = request.frameMaterial,
                volume = request.volume,
                manufacturingYear = request.manufacturingYear,
                fuel = request.fuel,
                numberOfSeats = request.numberOfSeats,
                gearBox = request.gearBox,
                style = request.style,
                payload = request.payload,
                carNumber = request.carNumber,
                km = request.km,
                origin = request.origin,
                version = request.version;
            let newRN = New({
                cateID: cateID,
                title: title,
                money: money,
                until: until,
                description: description,
                free: free,
                poster: poster,
                name: name,
                status: status,
                email: email,
                address: address,
                phone: phone,
                detailCategory: detailCategory,
                district: district,
                img: img,
                video: video,
            });
        }
        return next();
    } catch (err) {
        console.log(err);
        return functions.setError(res, err);
    }
};

exports.deleteNews = async(req, res) => {
    try {
        let idNews = req.query.idNews;
        let buySell = 2;
        if (idNews) {
            let news = await functions.getDataDeleteOne(New, {
                _id: idNews,
                buySell: buySell,
            });
            if (news.deletedCount === 1) {
                return functions.success(res, "Delete sell news by id success");
            } else {
                return functions.success(res, "Buy news not found");
            }
        } else {
            if (!(await functions.getMaxID(New))) {
                functions.setError(res, "No news existed", 513);
            } else {
                New.deleteMany({ buySell: buySell })
                    .then(() => functions.success(res, "Delete all news successfully"))
                    .catch((err) => functions.setError(res, err.message, 514));
            }
        }
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
};

// trang chủ
exports.getNew = async(req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        let userIdRaoNhanh = null;
        let searchItem = {
            _id: 1,
            title: 1,
            linkTitle: 1,
            address: 1,
            money: 1,
            createTime: 1,
            cateID: 1,
            pinHome: 1,
            userID: 1,
            img: 1,
            updateTime: 1,
            user: { _id: 1, idRaoNhanh365: 1, phone: 1, userName: 1, avatarUser: 1, type: 1, chat365_secret: 1, email: 1, 'inforRN365.xacThucLienket': 1, 'inforRN365.store_name': 1 },
            district: 1,
            ward: 1,
            city: 1,
            endvalue: 1,
            islove: 1,
            until: 1,
            endvalue: 1,
            type: 1,
            free: 1
        };
        let data = await New.aggregate([{
                $match: { buySell: 2, sold: 0, active: 1 },
            },
            {
                $limit: 50,
            },
            {
                $sort: { pinHome: -1, createTime: -1, order: -1 },
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "userID",
                    foreignField: "idRaoNhanh365",
                    as: "user",
                },
            },
            {
                $project: searchItem,
            },
        ]);
        if (token) {
            jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid token" });
                }
                userIdRaoNhanh = user.data.idRaoNhanh365;
            });
        }
        if (userIdRaoNhanh) {
            let dataLoveNew = await LoveNews.find({ id_user: userIdRaoNhanh });
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < dataLoveNew.length; j++) {
                    if (data[i].userID === dataLoveNew[j].id_user) {
                        data[i].islove = 1;
                    }
                }
            }
        }
        return functions.success(res, "get data success", { data });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error);
    }
};
// tìm kiếm tin
exports.searchNew = async(req, res, next) => {
    try {
        let userIdRaoNhanh = 0;
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        let link = req.body.link;
        let buySell = 1;
        let searchItem = {};
        let {
            page,
            pageSize,
            search_key,
            cateID,
            brand,
            wattage,
            microprocessor,
            ram,
            hardDrive,
            typeHardrive,
            screen,
            size,
            brandMaterials,
            vehicles,
            spareParts,
            interior,
            device,
            color,
            capacity,
            connectInternet,
            generalType,
            resolution,
            machineSeries,
            engine,
            accessary,
            han_su_dung,
            com_city,
            com_district,
            com_ward,
            com_address_num,
            productType,
            productGroup,
            warranty,
            loai_sanpham,
            money,
            endvalue,
            frameMaterial,
            volume,
            manufacturingYear,
            fuel,
            numberOfSeats,
            gearBox,
            style,
            payload,
            carNumber,
            km,
            origin,
            version,
            statusSell,
            nameApartment,
            numberOfStoreys,
            storey,
            mainDirection,
            balconyDirection,
            legalDocuments,
            statusInterior,
            acreage,
            length,
            width,
            buyingArea,
            kvCity,
            kvDistrict,
            kvWard,
            numberToletRoom,
            numberBedRoom,
            typeOfApartment,
            special,
            statusBDS,
            codeApartment,
            cornerUnit,
            nameArea,
            useArea,
            landType,
            officeType,
            block,
            kindOfPet,
            age,
            gender,
            exp,
            level,
            degree,
            jobType,
            jobDetail,
            jobKind,
            salary,
            benefit,
            skill,
            city,
            district,
            ward,
            payBy,
            phien_ban,
            sdung_sim,
            hang,
            loai_xe,
            xuat_xu,
            mau_sac,
            kich_co,
            chat_lieu_khung,
            baohanh,
            dong_xe,
            nam_san_xuat,
            dung_tich,
            td_bien_soxe,
            kieu_dang,
            hop_so,
            nhien_lieu,
            so_cho,
            trong_tai,
            loai_linhphu_kien,
            so_km_da_di,
            ten_toa_nha,
            td_macanho,
            ten_phan_khu,
            td_htmch_rt,
            so_pngu,
            so_pve_sinh,
            tong_so_tang,
            huong_chinh,
            giay_to_phap_ly,
            tinh_trang_noi_that,
            dac_diem,
            dien_tich,
            dientichsd,
            chieu_dai,
            chieu_rong,
            tinh_trang_bds,
            td_block_thap,
            tang_so,
            loai_hinh_canho,
            loaihinh_vp,
            loai_hinh_dat,
            kv_thanhpho,
            kv_quanhuyen,
            kv_phuongxa,
            product,
            timeStart,
            timeEnd,
            allDay,
            vehicloType,
            loai_hinh_sp,

            hang_vattu,
            loai_thiet_bi,
            cong_suat,

            khoiluong,
            loai_chung,

        } = req.body;

        if (!page && !pageSize) {
            return functions.setError(res, "missing data", 400);
        }
        const skip = (page - 1) * pageSize;
        const limit = Number(pageSize);
        if (
            (await functions.checkNumber(page)) === false ||
            (await functions.checkNumber(pageSize)) === false
        ) {

            return functions.setError(res, "page not found", 404);
        }
        if (link === "tat-ca-tin-dang-ban.html") {
            buySell = 2;
            searchItem = {
                _id: 1,
                title: 1,
                linkTitle: 1,
                address: 1,
                money: 1,
                createTime: 1,
                cateID: 1,
                pinHome: 1,
                userID: 1,
                img: 1,
                updateTime: 1,
                user: { _id: 1, idRaoNhanh365: 1, phone: 1, userName: 1, avatarUser: 1, type: 1, chat365_secret: 1, email: 1, 'inforRN365.xacThucLienket': 1, 'inforRN365.store_name': 1 },
                district: 1,
                ward: 1,
                city: 1,
                endvalue: 1,
                islove: 1,
                until: 1,
                endvalue: 1,
                type: 1,
                free: 1,
                viewCount: 1
            };
        } else if (link === "tat-ca-tin-dang-mua.html") {
            buySell = 1;
            searchItem = {
                _id: 1,
                title: 1,
                linkTitle: 1,
                address: 1,
                money: 1,
                createTime: 1,
                cateID: 1,
                pinHome: 1,
                userID: 1,
                img: 1,
                updateTime: 1,
                user: { _id: 1, idRaoNhanh365: 1, phone: 1, userName: 1, avatarUser: 1, type: 1, chat365_secret: 1, email: 1, 'inforRN365.xacThucLienket': 1, 'inforRN365.store_name': 1 },
                district: 1,
                ward: 1,
                city: 1,
                endvalue: 1,
                islove: 1,
                until: 1,
                endvalue: 1,
                type: 1,
                free: 1,
                bidding: 1,
                viewCount: 1
            };
        } else {
            return functions.setError(res, "page not found", 404);
        }
        let condition = { buySell };
        if (search_key) {
            let query = raoNhanh.createLinkTilte(search_key);
            condition.linkTitle = { $regex: `.*${query}.*` };
        }
        if (cateID) condition.cateID = cateID;
        if (brand) condition.brand = brand;
        if (wattage) condition.wattage = wattage;
        if (han_su_dung) condition.han_su_dung = han_su_dung;
        if (com_city) condition.com_city = com_city;
        if (com_district) condition.com_district = com_district;
        if (com_ward) condition.com_ward = com_ward;
        if (com_address_num) condition.com_address_num = com_address_num;
        if (productType) condition.productType = productType;
        if (productGroup) condition.productGroup = productGroup;
        if (baohanh) condition.baohanh = baohanh;
        if (microprocessor)
            condition["electroniceDevice.microprocessor"] = microprocessor;
        if (ram) condition["electroniceDevice.ram"] = ram;
        if (hardDrive) condition["electroniceDevice.hardDrive"] = hardDrive;
        if (typeHardrive)
            condition["electroniceDevice.typeHardrive"] = typeHardrive;
        if (screen) condition["electroniceDevice.screen"] = screen;
        if (size) condition["electroniceDevice.size"] = size;
        if (brand) condition["electroniceDevice.brand"] = brand;
        if (warranty) condition["electroniceDevice.warranty"] = warranty;
        if (device) condition["electroniceDevice.device"] = device;
        if (capacity) condition["electroniceDevice.capacity"] = capacity;
        if (sdung_sim) condition["electroniceDevice.sdung_sim"] = sdung_sim;
        if (phien_ban) condition["electroniceDevice.phien_ban"] = phien_ban;
        if (machineSeries)
            condition["electroniceDevice.machineSeries"] = machineSeries;
        if (hang) condition["vehicle.hang"] = hang;
        if (loai_xe) condition["vehicle.loai_xe"] = loai_xe;
        if (xuat_xu) condition["vehicle.xuat_xu"] = xuat_xu;
        if (mau_sac) condition["vehicle.mau_sac"] = mau_sac;
        if (kich_co) condition["vehicle.kich_co"] = kich_co;
        if (chat_lieu_khung) condition["vehicle.chat_lieu_khung"] = chat_lieu_khung;
        if (baohanh) condition["vehicle.baohanh"] = baohanh;
        if (dong_xe) condition["vehicle.dong_xe"] = dong_xe;
        if (nam_san_xuat) condition["vehicle.nam_san_xuat"] = nam_san_xuat;
        if (dung_tich) condition["vehicle.dung_tich"] = dung_tich;
        if (td_bien_soxe) condition["vehicle.td_bien_soxe"] = td_bien_soxe;
        if (phien_ban) condition["vehicle.phien_ban"] = phien_ban;
        if (hop_so) condition["vehicle.hop_so"] = hop_so;
        if (nhien_lieu) condition["vehicle.nhien_lieu"] = nhien_lieu;
        if (kieu_dang) condition["vehicle.kieu_dang"] = kieu_dang;
        if (so_cho) condition["vehicle.so_cho"] = so_cho;
        if (trong_tai) condition["vehicle.trong_tai"] = trong_tai;
        if (loai_linhphu_kien)
            condition["vehicle.loai_linhphu_kien"] = loai_linhphu_kien;
        if (so_km_da_di) condition["vehicle.so_km_da_di"] = so_km_da_di;
        if (numberOfSeats) condition["vehicle.numberOfSeats"] = numberOfSeats;
        if (ten_toa_nha) condition["realEstate.ten_toa_nha"] = ten_toa_nha;
        if (td_macanho) condition["realEstate.td_macanho"] = td_macanho;
        if (ten_phan_khu)
            condition["realEstate.ten_phan_khu"] = ten_phan_khu;
        if (td_htmch_rt) condition["realEstate.td_htmch_rt"] = td_htmch_rt;
        if (so_pngu) condition["realEstate.so_pngu"] = so_pngu;
        if (so_pve_sinh)
            condition["realEstate.so_pve_sinh"] = so_pve_sinh;
        if (tong_so_tang) condition["realEstate.tong_so_tang"] = tong_so_tang;
        if (huong_chinh) condition["realEstate.huong_chinh"] = huong_chinh;
        if (giay_to_phap_ly) condition["realEstate.giay_to_phap_ly"] = giay_to_phap_ly;
        if (tinh_trang_noi_that) condition["realEstate.tinh_trang_noi_that"] = tinh_trang_noi_that;
        if (dac_diem) condition["realEstate.dac_diem"] = dac_diem;
        if (dien_tich) condition["realEstate.dien_tich"] = dien_tich;
        if (dientichsd) condition["realEstate.dientichsd"] = dientichsd;
        if (chieu_dai) condition["realEstate.chieu_dai"] = chieu_dai;
        if (chieu_rong) condition["realEstate.chieu_rong"] = chieu_rong;
        if (tinh_trang_bds)
            condition["realEstate.tinh_trang_bds"] = tinh_trang_bds;
        if (td_block_thap) condition["realEstate.td_block_thap"] = td_block_thap;
        if (tang_so)
            condition["realEstate.tang_so"] = tang_so;
        if (loai_hinh_canho) condition["realEstate.loai_hinh_canho"] = loai_hinh_canho;
        if (loaihinh_vp) condition["realEstate.loaihinh_vp"] = loaihinh_vp;
        if (loai_hinh_dat) condition["realEstate.loai_hinh_dat"] = loai_hinh_dat;
        if (kv_thanhpho) condition["realEstate.kv_thanhpho"] = kv_thanhpho;
        if (kv_quanhuyen) condition["realEstate.kv_quanhuyen"] = kv_quanhuyen;
        if (kv_phuongxa) condition["realEstate.kv_phuongxa"] = kv_phuongxa;
        if (product) condition["ship.product"] = product;
        if (timeStart) condition["ship.timeStart"] = { $gte: { timeStart } };
        if (timeEnd) condition["ship.timeEnd"] = { $gte: { timeEnd } };
        if (allDay) condition["ship.allDay"] = allDay;
        if (loai_hinh_sp) condition["beautifull.loai_hinh_sp"] = loai_hinh_sp;
        if (loai_sanpham) condition["beautifull.loai_sanpham"] = loai_sanpham;
        if (han_su_dung) condition["beautifull.han_su_dung"] = han_su_dung;
        if (hang_vattu) condition["beautifull.hang_vattu"] = hang_vattu;

        if (loai_thiet_bi) condition["wareHouse.loai_thiet_bi"] = loai_thiet_bi;
        if (hang) condition["wareHouse.hang"] = hang;
        if (cong_suat) condition["wareHouse.cong_suat"] = cong_suat;
        if (hang_vattu) condition["wareHouse.hang_vattu"] = hang_vattu;
        if (dung_tich) condition["wareHouse.dung_tich"] = dung_tich;
        if (khoiluong) condition["wareHouse.khoiluong"] = khoiluong;
        if (loai_chung) condition["wareHouse.loai_chung"] = loai_chung;
        if (loai_sanpham) condition["wareHouse.loai_sanpham"] = loai_sanpham;
        if (block) condition["pet.block"] = block;
        if (kindOfPet) condition["pet.kindOfPet"] = kindOfPet;
        if (age) condition["pet.age"] = age;
        if (gender) condition["pet.gender"] = gender;
        if (jobType) condition["Job.jobType"] = jobType;
        if (jobDetail) condition["Job.jobDetail"] = jobDetail;
        if (jobKind) condition["Job.jobKind"] = jobKind;
        if (salary) condition["Job.salary"] = salary;
        if (gender) condition["Job.gender"] = gender;
        if (exp) condition["Job.exp"] = exp;
        if (level) condition["Job.level"] = level;
        if (degree) condition["Job.degree"] = degree;
        if (skill) condition["Job.skill"] = skill;
        if (city) condition["Job.city"] = city;
        if (district) condition["Job.district"] = district;
        if (ward) condition["Job.ward"] = ward;
        if (payBy) condition["Job.payBy"] = payBy;
        if (benefit) condition["Job.benefit"] = benefit;
        if (money) condition.startvalue = { $gte: money };
        if (endvalue) condition.endvalue = { $lte: endvalue };
        let data = await New.aggregate([{
                $lookup: {
                    from: "Users",
                    foreignField: "idRaoNhanh365",
                    localField: "userID",
                    as: "user",
                },
            },
            {
                $match: condition,
            },
            {
                $project: searchItem,
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);
        if (token) {
            jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid token" });
                }
                userIdRaoNhanh = user.data.idRaoNhanh365;
            });
        }
        if (userIdRaoNhanh) {

            let dataLoveNew = await LoveNews.find({ id_user: userIdRaoNhanh });
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < dataLoveNew.length; j++) {
                    if (data[i].userID === dataLoveNew[j].id_user) {
                        data[i].islove = 1;
                    }
                }
            }
        }
        //let data = await New.find(condition, searchItem).skip(skip).limit(limit);
        const totalCount = await New.countDocuments(condition);
        const totalPages = Math.ceil(totalCount / pageSize);
        return functions.success(res, "get data success", {
            totalCount,
            totalPages,
            data,
        });
    } catch (error) {
        console.log("🚀 ~ file: new.js:747 ~ exports.searchNew= ~ error:", error);
        return functions.setError(res, error);
    }
};
// tạo tin mua
exports.createBuyNew = async(req, res) => {
    try {
        // lấy id user từ req
        let userID = req.user.data.idRaoNhanh365;
        let type = req.user.data.type;

        // khởi tạo các biến có thể có
        let new_file_dthau = null;

        let new_file_nophs = null;

        let new_file_chidan = null;

        let noidung_chidan = req.body.noidung_chidan || null;
        let active = 1;
        // khai báo và gán giá trị các biến bắt buộc
        let {
            cateID,
            title,
            name,
            city,
            district,
            ward,
            apartmentNumber,
            description,
            status,
            endvalue,
            money,
            until,
            noidung_nhs,
            com_city,
            com_district,
            com_ward,
            com_address_num,
            han_bat_dau,
            han_su_dung,
            tgian_bd,
            tgian_kt,
            donvi_thau,
            phi_duthau,
            phone,
            email,
            new_job_kind
        } = req.body;
        //  tạo mảng img
        let img = [];

        //  lấy giá trị id lớn nhất rồi cộng thêm 1 tạo ra id mới
        let _id = (await functions.getMaxID(New)) + 1;

        // lấy thời gian hiện tại
        let createTime = new Date(Date.now());

        // khai báo đây là tin mua với giá trị là 1
        let buySell = 1;

        let File = req.files;

        // kiểm tra các điều kiện bắt buộc
        if (
            title &&
            name &&
            city && money &&
            district &&
            ward &&
            apartmentNumber &&
            description &&
            han_su_dung &&
            status &&
            phi_duthau &&
            endvalue &&
            phone &&
            email &&
            tgian_kt && tgian_bd && noidung_nhs
        ) {
            // tạolink title từ title người dùng nhập
            let linkTitle = raoNhanh.createLinkTilte(title);

            //kiểm tra title đã được người dùng tạo chưa
            let checktitle = await New.find({ userID, linkTitle });
            if (checktitle && checktitle.length !== 0) {
                return functions.setError(
                    res,
                    "The title already has a previous new word or does not have a keyword that is not allowed",
                    400
                );
            }
            // kiểm tra tiền nhập vào có phải số không
            else if (
                isNaN(phi_duthau) === true ||
                isNaN(money) === true ||
                isNaN(endvalue) === true
            ) {
                return functions.setError(res, "The input price is not a number", 400);
            }
            // kiểm tra số điện thoại
            else if ((await functions.checkPhoneNumber(phone)) === false) {
                return functions.setError(res, "Invalid phone number", 400);
            }
            // kiểm tra email
            else if ((await functions.checkEmail(email)) === false) {
                return functions.setError(res, "Invalid email", 400);
            }

            if (
                functions.checkDate(han_bat_dau) === true &&
                functions.checkDate(han_su_dung) === true &&
                functions.checkDate(tgian_bd) === true &&
                functions.checkDate(tgian_kt) === true
            ) {
                //  kiểm tra thời gian có nhỏ hơn thời gian hiện tại không
                if (
                    (await functions.checkTime(han_bat_dau)) &&
                    (await functions.checkTime(han_su_dung)) &&
                    (await functions.checkTime(tgian_bd)) &&
                    (await functions.checkTime(tgian_kt))
                ) {
                    //  kiểm tra thời gian nộp hồ sơ và thời gian thông báo có hợp lệ không
                    let date1 = new Date(han_bat_dau);
                    let date2 = new Date(han_su_dung);
                    let date3 = new Date(tgian_bd);
                    let date4 = new Date(tgian_kt);
                    if (date1 > date2 || date3 > date4 || date3 < date2) {
                        return functions.setError(res, "Nhập ngày không hợp lệ", 400);
                    }
                } else {
                    return functions.setError(
                        res,
                        "Ngày nhập vào nhỏ hơn ngày hiện tại",
                        400
                    );
                }
            } else {
                return functions.setError(res, "Invalid date format", 400);
            }

            if (File.Image) {
                if (File.Image.length) {
                    if (File.Image.length > 10)
                        return functions.setError(res, "Gửi quá nhiều ảnh", 400);
                    for (let i = 0; i < File.Image.length; i++) {
                        raoNhanh.uploadFileRaoNhanh(
                            "avt_tindangmua",
                            userID,
                            File.Image[i], [".jpg", ".png"]
                        );
                        img.push({
                            nameImg: functions.createLinkFileRaonhanh(
                                "avt_tindangmua",
                                userID,
                                File.Image[i].name
                            ),
                        });
                    }
                } else {
                    raoNhanh.uploadFileRaoNhanh("avt_tindangmua", userID, File.Image, [
                        ".jpg",
                        ".png",
                    ]);
                    img.push({
                        nameImg: functions.createLinkFileRaonhanh(
                            "avt_tindangmua",
                            userID,
                            File.Image.name
                        ),
                    });
                }
            }
            if (File.new_file_dthau) {
                if (File.new_file_dthau.length)
                    return functions.setError(res, "Gửi quá nhiều file");
                raoNhanh.uploadFileRaoNhanh("avt_tindangmua", userID, File.new_file_dthau, [
                    ".jpg",
                    ".png",
                    ".docx",
                    ".pdf",
                ]);
                new_file_dthau = functions.createLinkFileRaonhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_dthau.name
                );
            }
            if (File.new_file_nophs) {
                if (File.new_file_nophs.length)
                    return functions.setError(res, "Gửi quá nhiều file");
                raoNhanh.uploadFileRaoNhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_nophs, [".jpg", ".png", ".docx", ".pdf"]
                );
                new_file_nophs = functions.createLinkFileRaonhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_nophs.name
                );
            }
            if (File.new_file_chidan) {
                if (File.new_file_chidan.length)
                    return functions.setError(res, "Gửi quá nhiều file");
                raoNhanh.uploadFileRaoNhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_chidan, [".jpg", ".png", ".docx", ".pdf"]
                );
                new_file_chidan = functions.createLinkFileRaonhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_chidan.name
                );
            }
            //lưu dữ liệu vào DB
            const postNew = new New({
                _id,
                userID,
                title,
                linkTitle,
                name,
                city,
                money,
                district,
                ward,
                apartmentNumber,
                description,
                status,
                endvalue,
                phone,
                email,
                active,
                createTime,
                buySell,
                cateID,
                until,
                com_city,
                com_ward,
                com_address_num,
                com_district,
                type,
                img,
                tgian_bd,
                tgian_kt,
                bidding: {
                    han_bat_dau,
                    han_su_dung,
                    new_job_kind,
                    new_file_dthau,
                    noidung_nhs,
                    new_file_nophs,
                    noidung_chidan,
                    new_file_chidan,
                    donvi_thau,
                    phi_duthau
                }
            });
            await postNew.save();
            // await New.deleteMany({userID:5})
        } else {
            return functions.setError(res, "missing data", 404);
        }
        return functions.success(res, "post new success");
    } catch (error) {
        console.log("🚀 ~ file: new.js:1300 ~ exports.createBuyNew= ~ error:", error)
        return functions.setError(res, error);
    }
};

// sửa tin mua
exports.updateBuyNew = async(req, res, next) => {
    try {
        // lấy id user từ req
        let userID = req.user.data.idRaoNhanh365;
        let type = req.user.data.type;
        let newId = req.body.newId;
        // khởi tạo các biến có thể có
        let new_file_dthau = null;

        let new_file_nophs = null;

        let new_file_chidan = null;

        let noidung_chidan = req.body.noidung_chidan || null;
        // khai báo và gán giá trị các biến bắt buộc
        let {
            cateID,
            title,
            name,
            city,
            district,
            ward,
            apartmentNumber,
            description,
            status,
            endvalue,
            money,
            until,
            noidung_nhs,
            com_city,
            com_district,
            com_ward,
            com_address_num,
            han_bat_dau,
            han_su_dung,
            tgian_bd,
            tgian_kt,
            donvi_thau,
            phi_duthau,
            phone,
            email,
            new_job_kind
        } = req.body;
        //  tạo mảng img
        let img = [];



        // lấy thời gian hiện tại
        let updateTime = new Date(Date.now());

        // khai báo đây là tin mua với giá trị là 1

        let File = req.files;

        // kiểm tra các điều kiện bắt buộc
        if (
            title &&
            name &&
            city && money &&
            district &&
            ward &&
            apartmentNumber &&
            description &&
            han_su_dung &&
            status &&
            phi_duthau &&
            endvalue &&
            phone &&
            email &&
            tgian_kt && tgian_bd && noidung_nhs
        ) {
            // tạolink title từ title người dùng nhập
            let linkTitle = raoNhanh.createLinkTilte(title);

            //kiểm tra title đã được người dùng tạo chưa
            let checktitle = await New.find({ userID, linkTitle });
            if (checktitle && checktitle.length > 1) {
                return functions.setError(
                    res,
                    "The title already has a previous new word or does not have a keyword that is not allowed",
                    400
                );
            }
            // kiểm tra tiền nhập vào có phải số không
            else if (
                isNaN(phi_duthau) === true ||
                isNaN(money) === true ||
                isNaN(endvalue) === true
            ) {
                return functions.setError(res, "The input price is not a number", 400);
            }
            // kiểm tra số điện thoại
            else if ((await functions.checkPhoneNumber(phone)) === false) {
                return functions.setError(res, "Invalid phone number", 400);
            }
            // kiểm tra email
            else if ((await functions.checkEmail(email)) === false) {
                return functions.setError(res, "Invalid email", 400);
            }

            if (
                functions.checkDate(han_bat_dau) === true &&
                functions.checkDate(han_su_dung) === true &&
                functions.checkDate(tgian_bd) === true &&
                functions.checkDate(tgian_kt) === true
            ) {
                //  kiểm tra thời gian có nhỏ hơn thời gian hiện tại không
                if (
                    (await functions.checkTime(han_bat_dau)) &&
                    (await functions.checkTime(han_su_dung)) &&
                    (await functions.checkTime(tgian_bd)) &&
                    (await functions.checkTime(tgian_kt))
                ) {
                    //  kiểm tra thời gian nộp hồ sơ và thời gian thông báo có hợp lệ không
                    let date1 = new Date(han_bat_dau);
                    let date2 = new Date(han_su_dung);
                    let date3 = new Date(tgian_bd);
                    let date4 = new Date(tgian_kt);
                    if (date1 > date2 || date3 > date4 || date3 < date2) {
                        return functions.setError(res, "Nhập ngày không hợp lệ", 400);
                    }
                } else {
                    return functions.setError(
                        res,
                        "Ngày nhập vào nhỏ hơn ngày hiện tại",
                        400
                    );
                }
            } else {
                return functions.setError(res, "Invalid date format", 400);
            }
            let files_old = await New.findById(newId, {
                img: 1,
                new_file_dthau: 1,
                new_file_nophs: 1,
                new_file_chidan: 1,
            });
            if (File.Image) {
                if (File.Image.length) {
                    if (File.Image.length > 10)
                        return functions.setError(res, "Gửi quá nhiều ảnh", 400);
                    for (let i = 0; i < File.Image.length; i++) {
                        let check = await raoNhanh.uploadFileRaoNhanh(
                            "avt_tindangmua",
                            userID,
                            File.Image[i], [".jpg", ".png"]
                        );
                        if (check === false) return functions.setError(res, 'sai định dạng ảnh', 400)
                        img.push({
                            nameImg: functions.createLinkFileRaonhanh(
                                "avt_tindangmua",
                                userID,
                                File.Image[i].name
                            ),
                        });
                    }
                    if (files_old.img) {
                        for (let i = 0; i < files_old.img.length; i++) {
                            let text = files_old.img[i].nameImg.split("/").reverse()[0];
                            raoNhanh.deleteFileRaoNhanh(userID, text);
                        }
                    }
                    await New.findByIdAndUpdate(newId, { img })
                } else {
                    let check = await raoNhanh.uploadFileRaoNhanh("avt_tindangmua", userID, File.Image, [
                        ".jpg",
                        ".png",
                    ]);
                    if (check === false) return functions.setError(res, 'sai định dạng ảnh', 400)
                    img.push({
                        nameImg: functions.createLinkFileRaonhanh(
                            "avt_tindangmua",
                            userID,
                            File.Image.name
                        ),
                    });
                }
                if (files_old.img) {
                    for (let i = 0; i < files_old.img.length; i++) {
                        let text = files_old.img[i].nameImg.split("/").reverse()[0];
                        raoNhanh.deleteFileRaoNhanh(userID, text);
                    }
                }
                await New.findByIdAndUpdate(newId, { img })
            }
            if (File.new_file_dthau) {
                if (File.new_file_dthau.length)
                    return functions.setError(res, "Gửi quá nhiều file");
                let check = await raoNhanh.uploadFileRaoNhanh("avt_tindangmua", userID, File.new_file_dthau, [
                    ".jpg",
                    ".png",
                    ".docx",
                    ".pdf",
                ]);
                if (check === false) return functions.setError(res, 'sai định dạng ảnh', 400)
                new_file_dthau = functions.createLinkFileRaonhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_dthau.name
                );
                if (files_old.new_file_dthau) {
                    let text = files_old.new_file_dthau.split("/").reverse()[0];
                    raoNhanh.deleteFileRaoNhanh(userID, text);
                }
                await New.findByIdAndUpdate(newId, { bidding: { new_file_dthau } })
            }
            if (File.new_file_nophs) {
                if (File.new_file_nophs.length)
                    return functions.setError(res, "Gửi quá nhiều file");
                let check = await raoNhanh.uploadFileRaoNhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_nophs, [".jpg", ".png", ".docx", ".pdf"]
                );
                if (check === false) return functions.setError(res, 'sai định dạng ảnh', 400)
                new_file_nophs = functions.createLinkFileRaonhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_nophs.name
                );
                if (files_old.new_file_nophs) {
                    let text = files_old.new_file_nophs.split("/").reverse()[0];
                    raoNhanh.deleteFileRaoNhanh(userID, text);
                }
                await New.findByIdAndUpdate(newId, { bidding: { new_file_nophs } })
            }
            if (File.new_file_chidan) {
                if (File.new_file_chidan.length)
                    return functions.setError(res, "Gửi quá nhiều file");
                let check = await raoNhanh.uploadFileRaoNhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_chidan, [".jpg", ".png", ".docx", ".pdf"]
                );
                if (check === false) return functions.setError(res, 'sai định dạng ảnh', 400)
                new_file_chidan = await functions.createLinkFileRaonhanh(
                    "avt_tindangmua",
                    userID,
                    File.new_file_chidan.name
                );
                if (files_old.new_file_chidan) {
                    let text = files_old.new_file_chidan.split("/").reverse()[0];
                    raoNhanh.deleteFileRaoNhanh(userID, text);
                }

                await New.updateOne({ _id: newId }, { $set: { 'bidding.new_file_chidan': new_file_chidan } })
            }
            //lưu dữ liệu vào DB
            await New.findByIdAndUpdate(newId, {
                title,
                linkTitle,
                name,
                city,
                money,
                district,
                ward,
                apartmentNumber,
                description,
                status,
                endvalue,
                phone,
                email,
                updateTime,
                cateID,
                until,
                com_city,
                com_ward,
                com_address_num,
                com_district,
                type,
                tgian_bd,
                tgian_kt,
                'bidding.han_bat_dau': han_bat_dau,
                'bidding.han_su_dung': han_su_dung,
                'bidding.new_job_kind': new_job_kind,
                'bidding.noidung_nhs': noidung_nhs,
                'bidding.noidung_chidan': noidung_chidan,
                'bidding.donvi_thau': donvi_thau,
                'bidding.phi_duthau': phi_duthau,
            })

        } else {
            return functions.setError(res, "missing data", 404);
        }
        return functions.success(res, "post new success");
    } catch (error) {
        console.log("🚀 ~ file: new.js:1300 ~ exports.createBuyNew= ~ error:", error)
        return functions.setError(res, error);
    }
};

// chi tiết tin 
exports.getDetailNew = async(req, res, next) => {
    try {
        let cm_page = req.body.cm_page
        let cm_limit = 10;
        let cm_start = (cm_page - 1) * cm_limit;
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        let linkTitle = req.body.linkTitle.replace(".html", "");
        if (!linkTitle) {
            return functions.setError(res, "missing data", 400);
        }
        let id = linkTitle.split("-").reverse()[0];

        let buy = id.match(/[a-zA-Z]+/g)[0];
        let id_new = Number(id.replace(buy, ''));
        let danh_muc1 = null;
        let danh_muc2 = null;
        let danh_muc3 = null;
        let cate_Special = null;
        let buysell = null;
        let searchitem = null;
        let tintuongtu = [];
        let ListComment = [];
        let ListLike = [];
        let userIdRaoNhanh = 0;
        let thongTinChiTiet = {};
        if ((await functions.checkNumber(id_new)) === false) {
            return functions.setError(res, "invalid number", 404);
        }
        let check = await New.findById(id_new, { cateID: 1, userID: 1 });
        if (!check) {
            return functions.setError(res, "not found", 404);
        }
        cate1 = await CategoryRaoNhanh365.findById(check.cateID);
        danh_muc1 = cate1.name;

        if (cate1.parentId !== 0) {
            cate2 = await CategoryRaoNhanh365.findById(cate1.parentId);
            danh_muc2 = cate2.name;
            if (cate2.parentId !== 0) {
                cate3 = await CategoryRaoNhanh365.findById(cate2.parentId);
                danh_muc3 = cate3.name;
            }
        }
        if (danh_muc3) {
            cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc3);
        } else {
            if (danh_muc2) {
                cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc2);
            } else {
                cate_Special = await raoNhanh.checkNameCateRaoNhanh(danh_muc1);
            }
        }

        if (buy === "ct") {
            buysell = 1;
            searchitem = {
                _id: 1,
                title: 1,
                money: 1,
                endvalue: 1,
                city: 1,
                userID: 1,
                img: 1,
                updateTime: 1,
                type: 1,
                active: 1,
                until: 1,
                address: 1,
                ward: 1,
                detailCategory: 1,
                district: 1,
                viewCount: 1,
                apartmentNumber: 1,
                com_city: 1,
                com_district: 1,
                com_ward: 1,
                com_address_num: 1,
                bidding: 1,
                tgian_kt: 1,
                tgian_bd: 1,
                user: { _id: 1, idRaoNhanh365: 1, phone: 1, avatarUser: 1, 'inforRN365.xacThucLienket': 1, createdAt: 1, userName: 1, type: 1, chat365_secret: 1, email: 1 },
            };
        } else if (buy === "c") {
            buysell = 2;
            searchitem = {
                _id: 1,
                title: 1,
                linkTitle: 1,
                free: 1,
                address: 1,
                money: 1,
                createTime: 1,
                cateID: 1,
                pinHome: 1,
                pinCate: 1,
                new_day_tin: 1,
                buySell: 1,
                email: 1,
                tgian_kt: 1,
                tgian_bd: 1,
                phone: 1,
                userID: 1,
                img: 1,
                updateTime: 1,
                user: { _id: 1, idRaoNhanh365: 1, phone: 1, avatarUser: 1, userName: 1, type: 1, chat365_secret: 1, email: 1, 'inforRN365.xacThucLienket': 1, 'inforRN365.store_name': 1 },
                district: 1,
                ward: 1,
                description: 1,
                city: 1,
                islove: 1,
                until: 1,
                endvalue: 1,
                type: 1,
                detailCategory: 1,
                infoSell: 1,
                timePromotionStart: 1,
                timePromotionEnd: 1,
                quantitySold: 1,
                infoSell: 1,
                viewCount: 1,
                poster: 1,
                sold: 1,
                com_city: 1,
                com_district: 1,
                com_ward: 1,
                com_address_num: 1,

            };
        } else {
            return functions.setError(res, "not found data", 404);
        }
        if (cate_Special) {
            searchitem[`${cate_Special}`] = 1;
        }
        let data = await New.aggregate([{
                $lookup: {
                    from: "Users",
                    localField: "userID",
                    foreignField: "idRaoNhanh365",
                    as: "user",
                },
            },
            {
                $project: searchitem,
            },
            {
                $match: { _id: id_new },
            },
        ]);

        let cousao = await Evaluate.find({ newId: 0, blUser: data[0].userID }).count();
        let sumsao = await Evaluate.aggregate([{
                $match: {
                    newId: 0,
                    blUser: data[0].userID
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: "$stars" }
                }
            }
        ]);
        let thongTinSao = {};

        thongTinSao.cousao = cousao;
        thongTinSao.sumsao = sumsao[0].count;
        data[0].thongTinSao = thongTinSao
        data[0].thongTinChiTiet = thongTinChiTiet;

        data[0].danhmuc = { danh_muc1, danh_muc2, danh_muc3 };
        tintuongtu = await New.find({ cateID: check.cateID, active: 1, sold: 0, _id: { $ne: id_new } }, {
            _id: 1,
            title: 1,
            linkTitle: 1,
            free: 1,
            address: 1,
            money: 1,
            createTime: 1,
            cateID: 1,
            pinHome: 1,
            userID: 1,
            img: 1,
            updateTime: 1,
            user: { _id: 1, avatarUser: 1, phone: 1, userName: 1, type: 1, chat365_secret: 1, 'inforRN365.xacThucLienket': 1, email: 1, 'inforRN365.store_name': 1 },
            district: 1,
            ward: 1,
            city: 1,
            dia_chi: 1,
            islove: 1,
            until: 1,
            endvalue: 1,
            active: 1,
            type: 1,
            sold: 1,
            createTime: 1,
            free: 1,

        }).limit(6);
        let url = 'https://raonhanh365.vn/' + linkTitle + '.html';
        ListComment = await Comments.find({ url, parent_id: 0 }, {}, { time: -1 }, { cm_start }, { cm_limit }).lean();
        ListLike = await LikeRN.find({ forUrlNew: url, commentId: 0, type: { $lt: 8 } }, {}, { type: 1 })
        let ListReplyComment = [];
        let ListLikeComment = [];
        let ListLikeCommentChild = [];
        if (ListComment.length !== 0) {
            for (let i = 0; i < ListComment.length; i++) {
                ListLikeComment = await LikeRN.find({ forUrlNew: url, type: { $lt: 8 }, commentId: ListComment[i]._id }, {}, { type: 1 })
                    //
                ListReplyComment = await Comments.find({ url, parent_id: ListComment[i]._id }, {}, { time: -1 }).lean()
                ListComment[i].ListLikeComment = ListLikeComment
                ListComment[i].ListReplyComment = ListReplyComment
                    // lấy lượt like của từng trả lời
                for (let j = 0; j < ListReplyComment.length; j++) {
                    ListLikeCommentChild = await LikeRN.find({ forUrlNew: url, type: { $lt: 8 }, commentId: ListReplyComment[j]._id }, {}, { type: 1 })
                    ListReplyComment[j].ListLikeCommentChild = ListLikeCommentChild
                }
            }
        }
        data[0].ListComment = ListComment;
        data[0].ListLike = ListLike;
        await New.findByIdAndUpdate(id_new, { $inc: { viewCount: +1 } });
        if (tintuongtu) {
            data[0].tintuongtu = tintuongtu;
        }
        if (token) {
            jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid token" });
                }
                userIdRaoNhanh = user.data.idRaoNhanh365;
            });
        }
        if (userIdRaoNhanh) {
            let dataLoveNew = await LoveNews.find({ id_user: userIdRaoNhanh });
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < dataLoveNew.length; j++) {
                    if (data[i].userID === dataLoveNew[j].id_user) {
                        data[i].islove = 1;
                    }
                }
            }
        }
        let dataBidding = null;
        if (buysell === 1) {
            dataBidding = await Bidding.aggregate([{
                    $lookup: {
                        from: "RN365_News",
                        localField: 'newId',
                        foreignField: '_id',
                        as: 'new'
                    }
                },
                {
                    $lookup: {
                        from: "Users",
                        localField: 'userID',
                        foreignField: 'idRaoNhanh365',
                        as: 'user'
                    }
                },
                {
                    $match: {
                        'new._id': id_new
                    }
                }
            ])
            return functions.success(res, "get data success", { data, dataBidding });
        }



        return functions.success(res, "get data success", { data });
    } catch (error) {
        console.log("🚀 ~ file: new.js:1757 ~ exports.getDetailNew= ~ error:", error)
        return functions.setError(res, error);
    }
};

// yêu thích tin
exports.loveNew = async(req, res, next) => {
    try {
        let id = req.body.new_id;
        if ((await functions.checkNumber(id)) === false) {
            return functions.setError(res, "invalid number", 400);
        }
        let user = req.user.data.idRaoNhanh365;
        let checkLove = await LoveNews.find({ id_new: id, id_user: user });
        if (checkLove && checkLove.length !== 0) {
            await LoveNews.findOneAndDelete({ id_new: id, id_user: user });
        } else {
            createdAt = new Date(Date.now());
            let _id = 1 || (await functions.getMaxID(LoveNews)) + 1;
            await LoveNews.create({ _id, id_new: id, id_user: user, createdAt });
        }
        return functions.success(res, "love new success");
    } catch (error) {
        return functions.setError(res, error);
    }
};

// tao token
exports.createToken = async(req, res, next) => {
    try {
        let id = 4;
        let data = await AdminUser.findById(id);
        let token = await functions.createToken(data, "100d");
        let data1 = "Bazer " + token;
        return functions.success(res, { data1 });
    } catch (error) {
        console.log(error);
    }
};

// danh sách yêu thích tin
exports.newfavorite = async(req, res, next) => {
    try {
        let userID = req.user.data.idRaoNhanh365;
        let linkTitle = req.params.linkTitle;
        let searchItem = null;
        let buySell = null;
        if (linkTitle === "tin-mua-da-yeu-thich.html") {
            buySell = 1;
            searchItem = {
                title: 1,
                money: 1,
                name: 1,
                img: 1,
                address: 1,
                updateTime: 1,
                city: 1,
                district: 1,
                ward: 1,
                apartmentNumber: 1,
                free: 1,
                endvalue: 1,
                createTime: 1,
                cateID: 1,
                until: 1
            };
        } else if (linkTitle === "tin-ban-da-yeu-thich.html") {
            buySell = 2;
            searchItem = {
                title: 1,
                money: 1,
                name: 1,
                img: 1,
                address: 1,
                updateTime: 1,
                city: 1,
                district: 1,
                ward: 1,
                apartmentNumber: 1,
                free: 1,
                endvalue: 1,
                createTime: 1,
                cateID: 1,
                until: 1
            };
        }
        if (!buySell) {
            return functions.setError(res, "invalid data", 400);
        }
        let data = [];
        let soLuong = 0;
        let check = await LoveNews.find({ id_user: userID });
        if (check && check.length) {
            for (let i = 0; i < check.length; i++) {
                let datanew = await New.find({ _id: check[i].id_new, buySell },
                    searchItem
                );
                soLuong = await New.find({ _id: check[i].id_new, buySell },
                    searchItem
                ).count();
                data.push(datanew[0]);
            }
        }
        data.push({ soLuong: soLuong });
        return functions.success(res, "get data success", { data });
    } catch (error) {
        return functions.setError(res, error);
    }
};

// quản lí tin mua
exports.managenew = async(req, res, next) => {
    try {
        let linkTitle = req.params.linkTitle;
        let userID = req.user.data.idRaoNhanh365;
        let data = [];
        let tin_conhan = await New.find({
            userID,
            timeEndReceivebidding: { $gte: new Date(Date.now()) },
            buySell: 1,
        }).count();
        let tin_dangan = await New.find({ userID, active: 0, buySell: 1 }).count();
        let tong_soluong = await New.find({ userID, buySell: 1 }).count();
        let tin_hethan = tong_soluong - tin_conhan;
        let searchItem = {
            title: 1,
            bidding: 1,
            active: 1,
            createTime: 1,
            sold: 1,
            endvalue: 1,
            until_bidding: 1,
            img: 1,
            city: 1,
            district: 1,
            ward: 1,
            apartmentNumber: 1,
            endvalue: 1,
            until: 1,
            linkTitle: 1
        };
        if (linkTitle === "quan-ly-tin-mua.html") {
            data = await New.find({ userID, buySell: 1 }, searchItem);
        } else if (linkTitle === "tin-con-han.html") {
            data = await New.find({
                    userID,
                    buySell: 1,
                    timeEndReceivebidding: { $gte: new Date(Date.now()) },
                },
                searchItem
            );
        } else if (linkTitle === "tin-het-han.html") {
            data = await New.find({
                    userID,
                    buySell: 1,
                    timeEndReceivebidding: { $lte: new Date(Date.now()) },
                },
                searchItem
            );
        } else if (linkTitle === "tin-dang-an.html") {
            data = await New.find({ userID, buySell: 1, active: 0 }, searchItem);
        } else {
            return functions.setError(res, "page not found ", 404);
        }
        data.push({
            soluong: { tong_soluong, tin_conhan, tin_hethan, tin_dangan },
        });
        return functions.success(res, "get data success", { data });
    } catch (error) {
        return functions.setError(res, error);
    }
};

// tin đang dự thầu
exports.newisbidding = async(req, res, next) => {
    try {
        let linkTitle = req.params.linkTitle;
        let userID = req.user.data.idRaoNhanh365;
        let sl_tatCaTin = await Bidding.find({ userID }).count();
        let sl_tinConHan = 0;
        let searchItem = {
            title: 1,
            tgian_bd: 1,
            tgian_kt: 1,
            city: 1,
            district: 1,
            ward: 1,
            apartmentNumber: 1,
            endvalue: 1,
            money: 1,
            bidding: 1,
            linkTitle: 1,
            cateID: 1,
            sold: 1,
            until: 1,
            img: 1,
            createTime: 1,
            free: 1,
            pinCate: 1,
            pinHome: 1,
            active: 1,
            han_su_dung: 1,
            status: 1,
            Bidding: { _id: 1 }

        };
        let tinConHan = await New.aggregate([{
                $lookup: {
                    from: "RN365_Bidding",
                    localField: "_id",
                    foreignField: "newId",
                    as: "Bidding",
                },
            },
            {
                $match: {
                    "Bidding.userID": userID,
                    'bidding.han_su_dung': { $gte: new Date(Date.now()) },
                },
            },
            {
                $count: "all",
            },
        ]);
        if (tinConHan.length) {
            sl_tinConHan = tinConHan[0].all;
        }
        let sl_tinHetHan = sl_tatCaTin - sl_tinConHan;
        if (linkTitle === "quan-ly-tin-dang-du-thau.html") {
            data = await New.aggregate([{
                    $lookup: {
                        from: "RN365_Bidding",
                        localField: "_id",
                        foreignField: "newId",
                        as: "Bidding",
                    },
                },
                {
                    $match: { "Bidding.userID": userID },
                },
                {
                    $project: searchItem,
                },
            ]);
        } else if (linkTitle === "tin-dang-du-thau-con-han.html") {
            data = await New.aggregate([{
                    $lookup: {
                        from: "RN365_Bidding",
                        localField: "_id",
                        foreignField: "newId",
                        as: "Bidding",
                    },
                },
                {
                    $match: {
                        "Bidding.userID": userID,
                        'bidding.han_su_dung': { $gte: new Date(Date.now()) },
                    },
                },
                {
                    $project: searchItem,
                },
            ]);
        } else if (linkTitle === "tin-dang-du-thau-het-han.html") {
            data = await New.aggregate([{
                    $lookup: {
                        from: "RN365_Bidding",
                        localField: "_id",
                        foreignField: "newId",
                        as: "Bidding",
                    },
                },
                {
                    $match: {
                        "Bidding.userID": userID,
                        'bidding.han_su_dung': { $lt: new Date(Date.now()) },
                    },
                },
                {
                    $project: searchItem,
                },
            ]);
        } else {
            return functions.setError(res, "page not found ", 404);
        }
        return functions.success(res, "get data success", {
            sl_tatCaTin,
            sl_tinConHan,
            sl_tinHetHan,
            data,
        });
    } catch (error) {
        return functions.setError(res, error);
    }
};

// danh sách danh mục con/cha
exports.getListCate = async(req, res, next) => {
    try {
        let page, pageSize;
        if (!req.body.page) {
            page = 1;
        }
        if (!req.body.pageSize) {
            pageSize = 50;
        }
        page = Number(req.body.page);
        pageSize = Number(req.body.pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;

        let parentId = req.body.parentId;
        if (!parentId) {
            parentId = 0;
        }
        const listCate = await functions.pageFindWithFields(
            CategoryRaoNhanh365, { parentId: parentId }, { name: 1, parentId: 1 }, { _id: 1 },
            skip,
            limit
        );
        const totalCount = await functions.findCount(CategoryRaoNhanh365, {
            parentId: parentId,
        });
        return functions.success(res, "get list category success", {
            totalCount: totalCount,
            data: listCate,
        });
    } catch (error) {
        return functions.setError(res, error);
    }
};

// quản lí tin bán
exports.manageNewBuySell = async(req, res, next) => {
    try {
        let linkTitle = req.params.linkTitle;
        let userID = req.user.data.idRaoNhanh365;
        let data = [];
        let tong_soluong = await New.find({ userID, buySell: 2 }).count();
        let tinDangDang = await New.find({ userID, sold: 1, buySell: 2 }).count();
        let tinDaBan = await New.find({ userID, sold: 0, buySell: 2 }).count();
        let tinDangAn = await New.find({ userID, active: 0, buySell: 2 }).count();
        let searchItem = {
            title: 1,
            pinHome: 1,
            pinCate: 1,
            city: 1,
            district: 1,
            ward: 1,
            apartmentNumber: 1,
            address: 1,
            money: 1,
            han_su_dung: 1,
            linkTitle: 1,
            timeSell: 1,
            active: 1,
            createTime: 1,
            sold: 1,
            endvalue: 1,
            until: 1,
            img: 1,
            quantitySold: 1,
            totalSold: 1,
            free: 1,
            new_day_tin: 1
        };
        if (linkTitle === "quan-ly-tin-ban.html") {
            data = await New.find({ userID, buySell: 2 }, searchItem);
        } else if (linkTitle === "tin-dang-dang.html") {
            data = await New.find({ userID, sold: 1, buySell: 2 }, searchItem);
        } else if (linkTitle === "tin-da-ban.html") {
            data = await New.find({ userID, sold: 0, buySell: 2 }, searchItem);
        } else if (linkTitle === "tin-dang-an.html") {
            data = await New.find({ userID, active: 0, buySell: 2 }, searchItem);
        } else {
            return functions.setError(res, "page not found ", 404);
        }
        return functions.success(res, "get data success", {
            tong_soluong,
            tinDangDang,
            tinDangAn,
            tinDaBan,
            data,
        });
    } catch (error) {
        console.log(
            "🚀 ~ file: new.js:1315 ~ exports.manageNewBuySell= ~ error:",
            error
        );
        return functions.setError(res, error);
    }
};

// danh sách tin tìm ứng viên
exports.listCanNew = async(req, res, next) => {
    try {
        let linkTitle = req.params.linkTitle;

        let userID = req.user.data.idRaoNhanh365;
        let data = [];
        let tong_soluong = await New.find({ userID, cateID: 120 }).count();
        let tinDangTimUngVien = await New.find({
            userID,
            status: 1,
            cateID: 120,
        }).count();
        let tinDaTimUngVien = await New.find({
            userID,
            status: 0,
            cateID: 120,
        }).count();
        let searchItem = {
            title: 1,
            linkTitle: 1,
            cateID: 1,
            sold: 1,
            money: 1,
            endvalue: 1,
            until: 1,
            img: 1,
            createTime: 1,
            free: 1,
            pinCate: 1,
            pinHome: 1,
            active: 1,
            han_su_dung: 1,
            city: 1,
            district: 1,
            ward: 1,
            apartmentNumber: 1,
            address: 1,
            benefit: 1,
        };
        if (linkTitle === "quan-ly-tin-tim-ung-vien.html") {
            data = await New.find({ userID, cateID: 120 }, searchItem);
        } else if (linkTitle === "tin-dang-tim.html") {
            data = await New.find({ userID, status: 1, cateID: 120 }, searchItem);
        } else if (linkTitle === "tin-da-tim.html") {
            data = await New.find({ userID, status: 0, cateID: 120 }, searchItem);
        } else {
            return functions.setError(res, "page not found ", 404);
        }
        return functions.success(res, "get data success", {
            tong_soluong,
            tinDangTimUngVien,
            tinDaTimUngVien,
            data,
        });
    } catch (error) {
        return functions.setError(res, error);
    }
};

// // danh sách tin đang ứng tuyển
// exports.listJobNewApply = async (req, res, next) => {
//     try {
//         let userID = req.user.data._id;
//         let data = [];
//         data = await User.aggregate([
//             {
//                 $lookup: {
//                     from: "Order",
//                     localField: "_id",
//                     foreignField: "sellerId",
//                     as: "Order"
//                 }
//             },
//             {
//                 $match: { "Order.buyerId": 5}
//             },
//              {
//                 $project: { title: 1,img:1,userName:1, Order: {status:1,newId:1,createdAt:1 } }
//             }
//         ])
//         return functions.success(res, 'get data success', {data})
//     }
//     catch (error) {
//         return functions.setError(res, error)
//     }
// }

// danh sách tin tìm việc làm
exports.listJobNew = async(req, res, next) => {
    try {
        let linkTitle = req.params.linkTitle;
        let userID = req.user.data.idRaoNhanh365;
        let data = [];
        let tong_soluong = await New.find({ userID, cateID: 121 }).count();
        let tinDangTimViec = await New.find({
            userID,
            status: 1,
            cateID: 121,
        }).count();
        let tinDaTimViec = await New.find({
            userID,
            status: 0,
            cateID: 121,
        }).count();
        let searchItem = {
            title: 1,
            linkTitle: 1,
            cateID: 1,
            sold: 1,
            money: 1,
            endvalue: 1,
            until: 1,
            img: 1,
            createTime: 1,
            free: 1,
            pinCate: 1,
            pinHome: 1,
            active: 1,
            han_su_dung: 1,
            city: 1,
            district: 1,
            ward: 1,
            apartmentNumber: 1,
            address: 1,
            benefit: 1,
        };
        if (linkTitle === "quan-ly-tin-tim-viec-lam.html") {
            data = await New.find({ userID, cateID: 121 }, searchItem);
        } else if (linkTitle === "tin-dang-tim.html") {
            data = await New.find({ userID, status: 1, cateID: 121 }, searchItem);
        } else if (linkTitle === "tin-da-tim.html") {
            data = await New.find({ userID, status: 0, cateID: 121 }, searchItem);
        } else {
            return functions.setError(res, "page not found ", 404);
        }
        return functions.success(res, "get data success", {
            tong_soluong,
            tinDangTimViec,
            tinDaTimViec,
            data,
        });
    } catch (error) {
        return functions.setError(res, error);
    }
};

exports.likeNews = async(req, res, next) => {
    try {
        let { forUrlNew } = req.body;
        let ip = req.ip;
        let commnetId = req.body.commnetId || 0;
        let userName = req.user.data.userName;
        let type = req.body.type || null;
        let userId = req.user.data.idRaoNhanh365;
        let userAvatar = req.user.data.userAvatar;

        let like = await LikeRN.findOne({
            userIdChat: userId,
            forUrlNew: forUrlNew,
        });
        if (!forUrlNew) {
            return functions.setError(res, "Missing input value", 404);
        }
        if (like && type !== 0) {
            await LikeRN.findOneAndUpdate({ _id: like._id }, {
                type: type,
            });
            return functions.success(res, "Like new/comment RN365 success!");
        } else if (like && type === 0) {
            await LikeRN.findOneAndDelete({ _id: like._id });
            return functions.success(res, "Like new/comment RN365 success!");
        } else {
            const maxIdLike = await LikeRN.findOne({}, { _id: 1 })
                .sort({ _id: -1 })
                .limit(1)
                .lean();
            let newIdLike;
            if (maxIdLike) {
                newIdLike = Number(maxIdLike._id) + 1;
            } else newIdLike = 1;

            like = new LikeRN({
                _id: newIdLike,
                forUrlNew: forUrlNew,
                type: type,
                commnetId: commnetId,
                userName: userName,
                userAvatar: userAvatar,
                userIdChat: userId,
                ip: ip,
                time: Date(Date.now()),
            });
            await like.save();
        }
        return functions.success(res, "Like new/comment RN365 success!");
    } catch (err) {
        console.log("Err from server", err);
        return functions.setError(res, "Err from server", 500);
    }
};

exports.createApplyNews = async(req, res, next) => {
    try {
        let { candidateId, newId } = req.body;
        if (!candidateId || !newId) {
            return functions.setError(res, "Missing input value", 404);
        }
        let isExistUv = await ApplyNewsRN.findOne({
            candidateId: candidateId,
            newId,
        });
        if (isExistUv) {
            return functions.success(res, "Uv da ton tai!");
        } else {
            const maxIdApplyNew = await ApplyNewsRN.findOne({}, { _id: 1 })
                .sort({ _id: -1 })
                .limit(1)
                .lean();
            let newIdApplyNew;
            if (maxIdApplyNew) {
                newIdApplyNew = Number(maxIdApplyNew._id) + 1;
            } else newIdApplyNew = 1;

            like = new ApplyNewsRN({
                _id: newIdApplyNew,
                uvId: candidateId,
                newId: newId,
                applytime: Date(Date.now()),
            });
            await like.save();
        }
        return functions.success(res, "Candidate apply news success!");
    } catch (err) {
        console.log("Err from server", err);
        return functions.setError(res, "Err from server", 500);
    }
};

exports.deleteUv = async(req, res, next) => {
    try {
        let { newId } = req.body;
        let candidateId = req.user.data.idRaoNhanh365;
        if (!newId) {
            return functions.setError(res, "Missing input value", 404);
        }
        let candidate = await functions.getDataDeleteOne(ApplyNewsRN, {
            uvId: candidateId,
            newId: newId,
        });
        if (candidate.deletedCount === 1) {
            return functions.success(res, `Delete candidate success`);
        } else {
            return functions.success(res, "Candidate not found");
        }
    } catch (err) {

        return functions.setError(res, "Err from server", 500);
    }
};

// Quản lý khuyến mãi
exports.manageDiscount = async(req, res, next) => {
    try {
        let searchItem = {
            title: 1,
            money: 1,
            until: 1,
            'infoSell.promotionValue': 1,
            'infoSell.promotionType': 1,
            timePromotionStart: 1,
            timePromotionEnd: 1,
        };
        let userID = req.user.data.idRaoNhanh365;
        let search = { userID };
        let { searchKey, cateID, promotionType } = req.query;
        if (searchKey) {
            let query = raoNhanh.createLinkTilte(searchKey);
            search.linkTitle = { $regex: `.*${query}.*` };
        }
        if (cateID) search.cateID = cateID;
        if (!promotionType) search["infoSell.promotionType"] = { $gt: 0 };
        else {
            search["infoSell.promotionType"] = promotionType;
        }
        let data = await New.find(search, searchItem);
        return functions.success(res, "get data success", { data });
    } catch (err) {
        return functions.setError(res, err);
    }
};
exports.getListNewsApplied = async(req, res, next) => {
    try {
        let userId = req.user.data.idRaoNhanh365;
        let data = await ApplyNewsRN.aggregate([{
                $lookup: {
                    from: 'RN365_News',
                    localField: 'newId',
                    foreignField: '_id',
                    as: 'new'
                }
            },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'uvId',
                    foreignField: 'idRaoNhanh365',
                    as: 'user'
                }
            },
            {
                $match: { uvId: userId }
            }, {
                $project: {
                    'new.id': 1,
                    'new.title': 1,
                    'new.han_su_dung': 1,
                    'new.name': 1,
                    'new.linkTitle': 1,
                    'user.idRaoNhanh365': 1,
                    'user._id': 1,
                    'user.userName': 1,
                    'user.inforRN365.xacThucLienket': 1,
                    'user.inforRN365.store_name': 1,
                    _id: 1,
                    status: 1,
                    time: 1
                }
            }
        ])

        const totalCount = await functions.findCount(ApplyNewsRN, { uvId: userId });
        return functions.success(res, "get list news applied sucess", {
            totalCount: totalCount,
            data
        });
    } catch (err) {
        console.log("Err from server", err);
        return functions.setError(res, "Err from server", 500);
    }
};
//Danh sách tin mà áp dụng dịch vụ
exports.listJobWithPin = async(req, res, next) => {
    try {
        let userID = req.user.data.idRaoNhanh365;
        let data = await New.find({
            userID: userID,
            $or: [{ pinHome: 1 }, { pinCate: 1 }, { timePushNew: { $ne: null } }],
        }, { _id: 1, title: 1, money: 1, endvalue: 1, until: 1, createTime: 1, free: 1, img: 1, dia_chi: 1, address: 1, pinHome: 1, pinCate: 1, new_day_tin: 1, sold: 1, cateID: 1, updateTime: 1 });
        return functions.success(
            res, "Get List New With Pin Of User Success!", { data }
        );
    } catch (err) {
        console.log("Err from server", err);
        return functions.setError(res, "Err from server", 500);
    }
};

// thêm mới khuyến mãi
exports.addDiscount = async(req, res, next) => {
    try {
        let request = req.body;
        if (request.new_id && request.new_id.length) {
            for (let i = 0; i < request.new_id.length; i++) {
                let user_id = request.user_id;
                let loai_khuyenmai = request.loai_khuyenmai;
                let giatri_khuyenmai = request.giatri_khuyenmai;
                let ngay_bat_dau = request.ngay_bat_dau;
                let ngay_ket_thuc = request.ngay_ket_thuc;
                let new_id = request.new_id[i];
                if (
                    user_id &&
                    loai_khuyenmai &&
                    ngay_bat_dau &&
                    ngay_ket_thuc &&
                    giatri_khuyenmai
                ) {
                    if (loai_khuyenmai === 1 || loai_khuyenmai === 2) {} else {
                        return functions.setError(res, "Nhập ngày không hợp lệ", 400);
                    }
                    if (
                        functions.checkNumber(giatri_khuyenmai) === false ||
                        giatri_khuyenmai <= 0
                    ) {
                        return functions.setError(res, "invalid number", 400);
                    }

                    if (
                        (await functions.checkDate(ngay_bat_dau)) === true &&
                        (await functions.checkDate(ngay_ket_thuc)) === true
                    ) {
                        if (
                            (await functions.checkTime(ngay_bat_dau)) &&
                            (await functions.checkTime(ngay_ket_thuc))
                        ) {
                            let date1 = new Date(ngay_bat_dau);
                            let date2 = new Date(ngay_ket_thuc);
                            if (date1 >= date2) {
                                return functions.setError(res, "Nhập ngày không hợp lệ", 400);
                            }
                        } else {
                            return functions.setError(
                                res,
                                "Ngày nhập vào nhỏ hơn ngày hiện tại",
                                400
                            );
                        }
                    } else {
                        return functions.setError(res, "Invalid date format", 400);
                    }
                    let checkNew = await New.findById(new_id);
                    if (checkNew && checkNew.length !== 0) {
                        await New.findByIdAndUpdate(new_id, {
                            timePromotionStart: ngay_bat_dau,
                            timePromotionEnd: ngay_ket_thuc,
                            "infoSell.promotionType": loai_khuyenmai,
                            "infoSell.promotionValue": giatri_khuyenmai,
                        });
                    } else {
                        return functions.setError(res, "not found new", 400);
                    }
                } else {
                    return functions.setError(res, "missing data", 400);
                }
            }
        }
        return functions.success(res, "add discount success");
    } catch (error) {
        console.log("Err from server", error);
        return functions.setError(res, error);
    }
};

// bình luận
exports.comment = async(req, res, next) => {
    try {
        let { cm_id, url, comment } = req.body;
        let userID = req.user.data.idRaoNhanh365;
        let File = req.files;
        let parent_id = 0;
        if (cm_id) parent_id = cm_id;
        let content = comment;
        let ip = req.ip;
        let tag = req.body.tag || null;
        let time = new Date();
        let _id = (await functions.getMaxID(Comments)) + 1;

        if (url && parent_id && ip) {
            if (File.Image) {
                let data = await raoNhanh.uploadFileRaoNhanh(
                    "comment",
                    `${new Date().getFullYear()}/${new Date().getMonth() + 1
                    }/${new Date().getDate()}`,
                    File.Image, [".jpg", ".png"]
                );
                if (!data) {
                    return functions.setError("Ảnh không phù hợp");
                }
                let img = raoNhanh.createLinkFileRaonhanh(
                    "comment",
                    `${new Date().getFullYear()}/${new Date().getMonth() + 1
                    }/${new Date().getDate()}`,
                    File.Image.name
                );

                await Comments.create({
                    _id,
                    url,
                    parent_id,
                    content,
                    img,
                    ip,
                    sender_idchat: userID,
                    tag,
                    time,
                });
            } else {
                await Comments.create({
                    _id,
                    url,
                    parent_id,
                    content,
                    ip,
                    sender_idchat: userID,
                    tag,
                    time,
                });
            }
        } else {
            return functions.setError(res, "missing data", 400);
        }

        return functions.success(res, "comment success");
    } catch (error) {
        console.log(
            "🚀 ~ file: new.js:1647 ~ exports.comment=async ~ error:",
            error
        );
        return functions.setError(res, error);
    }
};

// sửa bình luận
exports.updateComment = async(req, res, next) => {
    try {
        let { comment, id_comment } = req.body;
        let userID = req.user.data.idRaoNhanh365;
        let File = req.files;
        let content = comment;
        let ip = req.ip;
        let tag = req.body.tag || null;
        if (id_comment && ip) {
            if (File.Image) {
                let data = await raoNhanh.uploadFileRaoNhanh(
                    "comment",
                    `${new Date().getFullYear()}/${new Date().getMonth() + 1
                    }/${new Date().getDate()}`,
                    File.Image, [".jpg", ".png"]
                );
                if (!data) {
                    return functions.setError("Ảnh không phù hợp");
                }
                let img = raoNhanh.createLinkFileRaonhanh(
                    "comment",
                    `${new Date().getFullYear()}/${new Date().getMonth() + 1
                    }/${new Date().getDate()}`,
                    File.Image.name
                );
                await Comments.findOneAndUpdate({ id_comment, sender_idchat: userID }, { content, img, tag });
            } else {
                await Comments.findOneAndUpdate({ id_comment, sender_idchat: userID }, { content, tag });
            }
        } else {
            return functions.setError(res, "missing data", 400);
        }

        return functions.success(res, "comment success");
    } catch (error) {
        console.log(
            "🚀 ~ file: new.js:1647 ~ exports.comment=async ~ error:",
            error
        );
        return functions.setError(res, error);
    }
};

exports.getListCandidateApplied = async(req, res, next) => {
    try {
        let userID = req.user.data.idRaoNhanh365;
        let searchItem = {
            new: {
                _id: 1,
                userID: 1,
                timeSell: 1,
                title: 1,
                linkTitle: 1,
                han_su_dung: 1,
                name: 1
            },
            user: { _id: 1, userName: 1, 'inforRN365.store_name': 1, type: 1, chat365_secret: 1, phone: 1 },
            _id: 1,
            time: 1,
            status: 1,
            note: 1
        }
        let data = await ApplyNews.aggregate([{
                $lookup: {
                    from: 'Users',
                    localField: 'uvId',
                    foreignField: 'idRaoNhanh365',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'RN365_News',
                    localField: 'newId',
                    foreignField: '_id',
                    as: 'new'
                }
            },
            {
                $match: { 'new.userID': userID }
            },
            {
                $project: searchItem
            }
        ])

        return functions.success(res, "get list candidate applied sucess", {
            data
        });
    } catch (err) {
        console.log("Err from server", err);
        return functions.setError(res, "Err from server", 500);
    }
};