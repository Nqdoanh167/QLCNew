const functions = require('../../services/functions');
const CategoryCompany = require('../../models/Timviec365/UserOnSite/Company/CategoryCompany');
const Users = require('../../models/Users');
const TblModules = require('../../models/Timviec365/TblModules');
const Blog = require('../../models/Timviec365/Blog/Posts');
const TrangVangCategory = require('../../models/Timviec365/UserOnSite/Company/TrangVangCategory');

// Trang chủ
exports.home = async(req, res) => {
    try {
        const seo = await TblModules.findOne({ module: "https://timviec365.vn/trang-vang-doanh-nghiep.html" }).lean();

        // Cập nhật ảnh trên cdn
        seo.sapo = await functions.renderCDNImage(seo.sapo)


        return await functions.success(res, "Thông tin trang vàng", {
            data: seo
        });
    } catch (error) {
        functions.setError(res, error.message)
    }
}


// danh sách lĩnh vực ngành nghề
exports.getLV = async(req, res, next) => {
    try {
        const data = await CategoryCompany.find();

        if (data.length > 0) return functions.success(res, 'Thành công', { data });

        return await functions.setError(ré, 'Không có dữ liệu', 404);
    } catch (err) {
        return functions.setError(res, err.message);
    };
};

exports.yp_list_company = async(req, res) => {
    try {
        const request = req.body,
            tagid = request.tagid,
            page = Number(request.page) || 1,
            pageSize = Number(request.pageSize) || 10;
        if (tagid) {
            const item = await CategoryCompany.findOne({
                id: tagid,
                $or: [
                    { parent_id: { $ne: 0 } },
                    { name_tag: '' }
                ]
            }).lean();
            if (item) {
                const condition = {
                    "inForCompany.tagLinhVuc": { $ne: null },
                    idTimViec365: { $gt: 694 },
                    city: item.city_tag,
                    type: 1,
                    fromWeb: "timviec365.vn"
                };
                // Lấy danh sách công ty
                const lists = await Users.find(condition).sort({ updatedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean();

                // Lấy tổng
                const count = await Users.countDocuments(condition);

                // Lấy từ khóa liên quan
                const list_reated = await CategoryCompany.find({
                    id: { $ne: item.id },
                    name_tag: { $regex: item.name_tag },
                    city_tag: 0,
                    parent_id: { $ne: 0 }
                }).select("id city_tag name_tag").limit(20);

                // Địa điểm liên quan
                const list_city_reated = await CategoryCompany.find({
                    id: { $ne: item.id },
                    name_tag: { $regex: item.name_tag },
                    city_tag: { $ne: 0 },
                }).select("id city_tag name_tag").limit(20);

                // Blog liên quan
                let conditionBlog = {
                    new_new: 0,
                    new_301: "",
                }

                if (item.name_tag != "") {
                    conditionBlog.new_title = { $regex: item.name_tag }
                }

                const blog = await Blog.find(conditionBlog)
                    .select("new_title_rewrite new_id new_picture new_title")
                    .sort({ new_id: -1 })
                    .limit(4)
                    .lean();

                return await functions.success(res, "Lấy thông tin thành công", {
                    data: { item, lists, count, list_reated, list_city_reated, blog }
                });
            }
            return await functions.setError(res, "Không tồn tại");
        }
        return await functions.setError(res, "Không đủ tham số");
    } catch (error) {
        return await functions.setError(res, error.message);
    }
}

exports.yp_list_cate = async(req, res) => {
    try {
        const request = req.body,
            tagid = request.tagid,
            page = Number(request.page) || 1,
            pageSize = Number(request.pageSize) || 10;
        if (tagid) {
            const item = await CategoryCompany.findOne({
                id: tagid,
                parent_id: 0,
                name_tag: { $ne: "" }
            }).lean();

            if (item) {
                // Lấy danh mục tiêu điểm
                const dm_td = CategoryCompany.find({
                    parent_id: item.id
                }).sort({ id: -1 }).limit(12);

                // Lấy liên kết nhanh
                const lkn = TrangVangCategory.find({
                    parent_id: item.id
                });

                const condition = {
                    $and: [{
                            $or: [
                                { "inForCompany.description": { $regex: keyword, $options: 'i' } },
                                { userName: { $regex: keyword, $options: 'i' } },
                                { "inForCompany.tagLinhVuc": { $regex: keyword, $options: 'i' } }
                            ]
                        },
                        { userName: { $ne: '' } },
                        { idTimViec365: { $gt: 694 } },
                        { usc_redirect: '' },
                        { type: 1 },
                        { fromWeb: "timviec365.vn" }
                    ]
                };
                // Lấy công ty tương ứng
                const lists = await Users.find()
                    .select('usc_id usc_company usc_logo usc_alias usc_create_time')
                    .sort({ $expr: { $regexMatch: { input: "inForCompany.tagLinhVuc", regex: keyword, options: 'i' } } })
                    .sort({ usc_update_time: -1 })
                    .skip((page - 1) * pageSize)
                    .limit(pageSize)
                    .lean();

                // Lấy tổng
                const count = await Users.countDocuments(condition);

                // Lấy từ khóa liên quan
                const list_reated = await CategoryCompany.find({
                    id: { $ne: item.id },
                    name_tag: { $regex: item.name_tag },
                    city_tag: 0,
                    parent_id: { $ne: 0 }
                }).select("id city_tag name_tag").limit(20);

                // Địa điểm liên quan
                const list_city_reated = await CategoryCompany.find({
                    id: { $ne: item.id },
                    name_tag: { $regex: item.name_tag },
                    city_tag: { $ne: 0 },
                }).select("id city_tag name_tag").limit(20);

                // Blog liên quan
                let conditionBlog = {
                    new_new: 0,
                    new_301: "",
                }

                if (item.name_tag != "") {
                    conditionBlog.new_title = { $regex: item.name_tag }
                }

                const blog = await Blog.find(conditionBlog)
                    .select("new_title_rewrite new_id new_picture new_title")
                    .sort({ new_id: -1 })
                    .limit(4)
                    .lean();

                return await functions.success(res, "Lấy thông tin thành công", {
                    data: { item, lists, count, list_reated, list_city_reated, blog }
                });
            }
            return await functions.setError(res, "Không tồn tại");
        }
        return await functions.setError(res, "Không đủ tham số");
    } catch (error) {
        return await functions.setError(res, error.message);
    }
}

// tìm kiếm công ty theo điều kiện
exports.findCompany = async(req, res, next) => {
    try {
        const request = req.body,
            keyword = request.keyword,
            page = Number(request.page) || 1,
            pageSize = Number(request.pageSize) || 10;
        if (keyword) {

            const condition = {
                $and: [{
                        $or: [
                            { "inForCompany.description": { $regex: keyword, $options: 'i' } },
                            { userName: { $regex: keyword, $options: 'i' } },
                            { "inForCompany.tagLinhVuc": { $regex: keyword, $options: 'i' } }
                        ]
                    },
                    { userName: { $ne: '' } },
                    { idTimViec365: { $gt: 694 } },
                    { usc_redirect: '' },
                    { type: 1 },
                    { fromWeb: "timviec365.vn" }
                ]
            };
            // Lấy công ty tương ứng
            const lists = await Users.find()
                .select('usc_id usc_company usc_logo usc_alias usc_create_time')
                .sort({ $expr: { $regexMatch: { input: "inForCompany.tagLinhVuc", regex: keyword, options: 'i' } } })
                .sort({ usc_update_time: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean();

            // Lấy tổng
            const count = await Users.countDocuments(condition);

            // Lấy từ khóa liên quan
            const list_reated = await CategoryCompany.find({
                id: { $ne: item.id },
                name_tag: { $regex: keyword },
                city_tag: 0,
                parent_id: { $ne: 0 }
            }).select("id city_tag name_tag").limit(20);

            // Địa điểm liên quan
            const list_city_reated = await CategoryCompany.find({
                id: { $ne: item.id },
                name_tag: { $regex: keyword },
                city_tag: { $ne: 0 },
            }).select("id city_tag name_tag").limit(20);

            // Blog liên quan
            let conditionBlog = {
                new_new: 0,
                new_301: "",
            }

            if (item.name_tag != "") {
                conditionBlog.new_title = { $regex: keyword }
            }

            const blog = await Blog.find(conditionBlog)
                .select("new_title_rewrite new_id new_picture new_title")
                .sort({ new_id: -1 })
                .limit(4)
                .lean();

            return await functions.success(res, "Lấy thông tin thành công", {
                data: { item, lists, count, list_reated, list_city_reated, blog }
            });

            return await functions.setError(res, "Không tồn tại");
        }
        return await functions.setError(res, "Không đủ tham số");
    } catch (error) {
        return await functions.setError(res, error.message);
    }
};