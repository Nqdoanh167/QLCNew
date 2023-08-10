const fnc = require('../services/functions');
const City = require('../models/City');
const District = require('../models/District');
const CategoryTv365 = require('../models/Timviec365/CategoryJob');
const TagTv365 = require('../models/Timviec365/UserOnSite/Company/Keywords');
const LangCv = require('../models/Timviec365/CV/CVLang');
const CVDesign = require('../models/Timviec365/CV/CVDesign');
const TblModules = require('../models/Timviec365/TblModules');

// lấy danh sach thành phố
exports.getDataCity = async(req, res, next) => {
    try {
        let city = await fnc.getDatafind(City),
            data = [];

        for (let index = 0; index < city.length; index++) {
            const element = city[index];
            data.push({
                "cit_id": element._id,
                "cit_name": element.name,
                "cit_order": element.order,
                "cit_type": element.type,
                "cit_count": element.count,
                "cit_count_vl": element.countVl,
                "cit_count_vlch": element.countVlch,
                "postcode": element.postCode
            });
        }
        return fnc.success(res, "Lấy dữ liệu thành công", { data })

    } catch (error) {
        console.log(error)
        return fnc.setError(res, error)
    }
}

// lấy danh sách quận huyện theo id thành phố
exports.getDataDistrict = async(req, res, next) => {
    try {
        let idCity = req.body.cit_id;
        let condition = {};
        if (idCity) {
            condition.parent = idCity;
        }
        const lists = await fnc.getDatafind(District, condition);
        let district = [];
        for (let i = 0; i < lists.length; i++) {
            let item = lists[i];
            district.push({
                'cit_id': item._id,
                'cit_name': item.name,
                'cit_order': item.order,
                'cit_type': item.type,
                'cit_count': item.count,
                'cit_parent': item.parent
            });

        }
        return fnc.success(res, "Lấy dữ liệu thành công", { data: district })
        return fnc.setError(res, 'Chưa truyền id tỉnh thành', 404)
    } catch (error) {
        console.log(error)
        return fnc.setError(res, error)
    }
}

// lấy danh sách ngành nghề timviec365
exports.getDataCategoryTv365 = async(req, res, next) => {
    try {
        let active = req.body.active;
        let cat_only = req.body.cat_only;
        let condition = {};
        if (active != undefined) {
            condition.active = active;
        }
        if (cat_only != undefined) {
            condition.cat_only = cat_only;
        }
        let category = await fnc.getDatafind(CategoryTv365, condition);
        let data = [];
        for (let index = 0; index < category.length; index++) {
            const element = category[index];
            data.push({
                "cat_id": element._id,
                "cat_name": element.name,
                "cat_tags": element.tags,
                "cat_count": element.countCandi,
                "cat_count_vl": element.countJob,
                "cat_ut": element.cat_ut,
                "cat_lq": element.cat_tlq,
                "cat_name_new": element.cat_name_new,
                "cat_order_show": element.cat_order_show,
            });
        }
        return fnc.success(res, "Lấy dữ liệu thành công", { data })
    } catch (error) {
        console.log(error)
        return fnc.setError(res, error)
    }
}

// Lấy danh sách tag timviec365
exports.getDataTagTv365 = async(req, res, next) => {
    try {
        let type = req.body.type || "tagKey",
            cate_id = req.body.cate_id || null;
        let condition = {},
            data = [];

        if (type == 'tagKey') {
            condition.name = { $ne: "" };
            condition.cbID = 0;
            condition.cityID = 0;
            condition.redirect301 = "";
        }
        if (cate_id != null) {
            condition.name = { $ne: "" };
            condition.cateLq = cate_id;
            condition.cbID = 0;
            condition.cityID = 0;
            condition.cateID = 0;
            condition.err = 0;
            condition.redirect301 = "";
        }

        lists = await TagTv365.find(condition, { name: 1, cateLq: 1 }).sort({ _id: -1 }).lean();
        for (let index = 0; index < lists.length; index++) {
            const element = lists[index];
            data.push({
                "key_id": element._id,
                "key_name": element.name,
                "key_cate_lq": element.cateLq,
            });
        }
        return fnc.success(res, "Lấy dữ liệu thành công", { data })
    } catch (error) {
        console.log(error)
        return fnc.setError(res, error)
    }
}

// lấy danh sách ngôn ngữ cv
exports.getDataLangCV = async(req, res, next) => {
    try {
        lists = await LangCv.find({}, {
            name: 1,
            alias: 1
        }).lean();
        return fnc.success(res, "Lấy dữ liệu thành công", { data: lists })
    } catch (error) {
        console.log(error)
        return fnc.setError(res, error)
    }
}

// Lấy danh sách thiết kế cv
exports.getDataDesignCV = async(req, res, next) => {
    try {
        lists = await CVDesign.find({}, {
            name: 1,
            alias: 1
        }).lean();
        return fnc.success(res, "Lấy dữ liệu thành công", { data: lists })
    } catch (error) {
        console.log(error)
        return fnc.setError(res, error)
    }
}

// Lấy nội dung bảng modules để seo
exports.modules = async(req, res) => {
    const { moduleRequets } = req.body;
    if (moduleRequets) {
        const seo = await TblModules.findOne({
            module: moduleRequets
        }).lean();

        seo.sapo = await fnc.renderCDNImage(seo.sapo)
        return await fnc.success(res, "Thông tin module", {
            data: seo
        });
    }
    return await fnc.setError(res, "Không có tham số tìm kiếm");
}