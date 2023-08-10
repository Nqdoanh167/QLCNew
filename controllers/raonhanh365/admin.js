const functions = require('../../services/functions');
const AdminUser = require('../../models/Raonhanh365/Admin/AdminUser');
const Category = require('../../models/Raonhanh365/Category');
const News = require('../../models/Raonhanh365/New');
const PriceList = require('../../models/Raonhanh365/PriceList');
const Users = require('../../models/Users');
const History = require('../../models/Raonhanh365/History');
const Blog = require('../../models/Raonhanh365/Admin/Blog');
const ReportNews = require('../../models/Raonhanh365/NewReport');
const NetworkOperator = require('../../models/Raonhanh365/NetworkOperator')
const AdminUserRight = require('../../models/Raonhanh365/Admin/AdminUserRight');

const serviceRN = require('../../services/rao nhanh/raoNhanh');
const folderImg = "img_blog";
const md5 = require('md5');
const Cart = require("../../models/Raonhanh365/Cart");
const RegisterFail = require('../../models/Raonhanh365/RegisterFail');
const NewReport = require('../../models/Raonhanh365/NewReport');
const New = require('../../models/Raonhanh365/New');
const Order = require('../../models/Raonhanh365/Order');

//đăng nhập admin
exports.loginAdminUser = async (req, res, next) => {
    try {
        if (req.body.loginName && req.body.password) {
            const loginName = req.body.loginName
            const password = req.body.password
            let findUser = await functions.getDatafindOne(AdminUser, { loginName })
            if (!findUser) {
                return functions.setError(res, "không tìm thấy tài khoản trong bảng user", 200)
            }
            let checkPassword = await functions.verifyPassword(password, findUser.password)
            if (!checkPassword) {
                return functions.setError(res, "Mật khẩu sai", 200)
            }
            let updateUser = await functions.getDatafindOneAndUpdate(Users, { loginName }, {
                date: new Date(Date.now())
            })
            const token = await functions.createToken(findUser, "2d")
            return functions.success(res, 'Đăng nhập thành công', { token: token })

        }
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }

}

exports.getListAdminUser = async (req, res, next) => {
    try {
        //lay cac tham so dieu kien tim kiem tin
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
        let idAdmin = req.body.idAdmin;
        let condition = {};
        if (idAdmin) condition._id = Number(idAdmin);
        let fields = { loginName: 1, name: 1, email: 1, phone: 1, editAll: 1, langId: 1, active: 1 };
        let listAdminUser = await functions.pageFindWithFields(AdminUser, condition, fields, { _id: 1 }, skip, limit);

        // lap qua danh sach user
        for (let i = 0; i < listAdminUser.length; i++) {
            let adminUserRight = await AdminUserRight.find({ adminId: listAdminUser[i]._id });
            let arrIdModule = [],
                arrRightAdd = [],
                arrRightEdit = [],
                arrRightDelete = []
            // lap qua cac quyen cua admindo
            for (let j = 0; j < adminUserRight.length; j++) {
                arrIdModule.push(adminUserRight[j].moduleId);
                arrRightAdd.push(adminUserRight[j].add);
                arrRightEdit.push(adminUserRight[j].edit);
                arrRightDelete.push(adminUserRight[j].delete);
            }
            let adminUser = listAdminUser[i];
            let tmpOb = { adminUser, arrIdModule, arrRightAdd, arrRightEdit, arrRightDelete };
            listAdminUser[i] = tmpOb;
        }
        const totalCount = await functions.findCount(AdminUser, condition);
        return functions.success(res, "get list blog success", { totalCount: totalCount, data: listAdminUser });
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}


exports.getAndCheckDataAdminUser = async (req, res, next) => {
    try {
        let { loginName, name, phone, email, editAll, langId, active, accessModule, adminId } = req.body;
        if (!loginName || !phone || !phone) {
            return functions.setError(res, "Missing input value", 404)
        }

        // xoa cac quyen hien tai cua admin neu chon muc sua
        if (adminId) {
            let adminUserRight = await AdminUserRight.deleteMany({ adminId: adminId });
        } else {
            const maxIdAdminUser = await AdminUser.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
            if (maxIdAdminUser) {
                adminId = Number(maxIdAdminUser._id) + 1;
            } else adminId = 1;

        }
        //cap quyen cho admin ca them moi+sua
        let { arrIdModule, arrRightAdd, arrRightEdit, arrRightDelete } = req.body;
        arrIdModule = arrIdModule.split(",");
        arrRightAdd = arrRightAdd.split(",");
        arrRightEdit = arrRightEdit.split(",");
        arrRightDelete = arrRightDelete.split(",");

        //
        for (let i = 0; i < arrIdModule.length; i++) {
            //tao id cho bang phan quyen
            const maxIdAdminUserRight = await AdminUserRight.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
            let newIdAdminUserRight;
            if (maxIdAdminUserRight) {
                newIdAdminUserRight = Number(maxIdAdminUserRight._id) + 1;
            } else newIdAdminUserRight = 1;

            let fieldsRight = {
                _id: newIdAdminUserRight,
                adminId: adminId,
                moduleId: arrIdModule[i],
                add: arrRightAdd[i],
                edit: arrRightEdit[i],
                deletelet: arrRightDelete[i]
            }

            let adminUserRight = new AdminUserRight(fieldsRight);
            await adminUserRight.save();
        }

        // them cac truong muon them hoac sua
        req.info = {
            _id: adminId,
            loginName: loginName,
            name: name,
            phone: phone,
            email: email,
            langId: langId,
            editAll: editAll,
            active: active,
            accessModule: accessModule,
        }
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createAdminUser = async (req, res, next) => {
    try {
        // luu thong tin admin
        let password = req.body.password;
        let fields = req.info;
        fields.password = md5(password);

        let adminUser = new AdminUser(fields);
        await adminUser.save();
        return functions.success(res, 'Create AdminUser and AdminUserRight RN365 success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateAdminUser = async (req, res, next) => {
    try {
        if (!req.body.adminId)
            return functions.setError(res, "Missing input value id admin!", 404);
        let fields = req.info;
        let adminId = req.body.adminId;
        fields.password = md5(password);
        delete fields._id;
        let existsAdminUser = await AdminUser.findOne({ _id: adminId });
        if (existsAdminUser) {

            await AdminUser.findOneAndUpdate({ _id: adminId }, fields);
            return functions.success(res, "AdminUser edited successfully");
        }
        return functions.setError(res, "AdminUser not found!", 505);
    } catch (err) {
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.deleteAdminUser = async (req, res, next) => {
    try {
        let userID = Number(req.query.userID);
        if (userID) {
            let user = await functions.getDataDeleteOne(Users, { _id: userID });
            if (user.deletedCount === 1) {
                return functions.success(res, `Delete user with _id=${userID} success`);
            } else {
                return functions.success(res, "User not found");
            }
        }
        return functions.setError(res, "Missing input userID", 500);
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}

//-----------------------------------------------------------controller quan ly danh muc----------------------------------------------------------------

// lay ra danh sach
exports.getListCategory = async (req, res, next) => {
    try {
        let { page, pageSize, _id, name, parentId } = req.body;
        if (!page) {
            return functions.setError(res, "Missing input page", 401);
        }
        if (!pageSize) {
            return functions.setError(res, "Missing input pageSize", 402);
        }
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let condition = {};
        if (_id) condition._id = Number(_id);
        if (name) condition.name = new RegExp(name);
        if (parentId) condition.parentId = parentId;

        const listCategory = await functions.pageFind(Category, condition, { _id: 1 }, skip, limit);
        const totalCount = await functions.findCount(Category, condition);
        return functions.success(res, "get list category success", { totalCount: totalCount, data: listCategory });
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

exports.getAndCheckDataCategory = async (req, res, next) => {
    try {
        let { parentId, adminId, name, order, description } = req.body;
        if (!name || !order) {
            return functions.setError(res, "Missing input value", 404)
        }
        // them cac truong muon them hoac sua
        req.info = {
            parentId: parentId,
            adminId: adminId,
            name: name,
            order: order,
            description: description
        }
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createCategory = async (req, res, next) => {
    try {
        let fields = req.info;
        const maxIdCategory = await Category.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
        let newIdCategory;
        if (maxIdCategory) {
            newIdCategory = Number(maxIdCategory._id) + 1;
        } else newIdCategory = 1;
        fields._id = newIdCategory;
        let category = new Category(fields);
        await category.save();
        return functions.success(res, 'Create category RN365 success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateCategory = async (req, res, next) => {
    try {
        if (!req.body.cateID)
            return functions.setError(res, "Missing input value id cate!", 404);
        let cateID = req.body.cateID;
        let fields = req.info;

        let existsCategory = await Category.findOne({ _id: cateID });
        if (existsCategory) {

            await Category.findOneAndUpdate({ _id: cateID }, fields);
            return functions.success(res, "Category edited successfully");
        }
        return functions.setError(res, "Category not found!", 505);
    } catch (err) {
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}


//---------------------------------------------------------controller quan ly tin(tin rao vat, tin mua)-----------------------------------------------
//-------gom ca quan ly tin tuyen dung va tin tim viec lam -----> bang cach su dung truong cateID de phan biet

//api lay ra danh sach va tim kiem tin
// khi truyen cateID = 120, 121 se lay dc tin tuyen dung va tin tim viec lam
exports.getListNews = async (req, res, next) => {
    try {
        let { page, pageSize, _id, buySell, title, cateID, fromDate, toDate } = req.body;
        if (!page) {
            return functions.setError(res, "Missing input page", 401);
        }
        if (!pageSize) {
            return functions.setError(res, "Missing input pageSize", 402);
        }
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        //lay cac tham so dieu kien tim kiem tin

        let condition = {};
        if (buySell) condition.buySell = Number(buySell);// 1: tin mua, 2: tin ban
        if (_id) condition._id = Number(_id);
        if (title) condition.title = new RegExp(title);
        if (cateID) condition.cateID = Number(cateID);// cate

        // tu ngay den ngay
        if (fromDate) {
            condition.createTime = { $gte: new Date(fromDate) }
        }
        if (toDate) {
            condition.createTime = { $lte: new Date(toDate) };
        }
        let fields = { _id: 1, title: 1, linkTitle: 1, img: 1, cateID: 1, createTime: 1, active: 1, city: 1, userID: 1, email: 1, updateTime: 1 };
        let listNews = await News.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: "Users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "matchedDocuments"
                }
            },
            { $project: fields },
            { $sort: { _id: 1 } },
            { $skip: skip },
            { $limit: limit }
        ])
        // let listNews = await News.find(condition, fields);
        const totalCount = await News.countDocuments(condition);
        return functions.success(res, 'Get list news success', { totalCount, listNews });
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

exports.getAndCheckDataNews = async (req, res, next) => {
    try {
        let { title, description, money } = req.body;
        if (!title || !description) {
            return functions.setError(res, "Missing input value", 404)
        }
        // them cac truong muon them hoac sua
        req.info = {
            title: title,
            description: description,
            money: money
        }
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createNews = async (req, res, next) => {
    try {
        let fields = req.info;
        const maxIdNews = await News.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
        let newIdNews;
        if (maxIdNews) {
            newIdNews = Number(maxIdNews._id) + 1;
        } else newIdNews = 1;
        fields._id = newIdNews;
        fields.createTime = Date(Date.now());
        let news = new News(fields);
        await news.save();
        return functions.success(res, 'Create news RN365 success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateNews = async (req, res, next) => {
    try {
        if (!req.body.newsID)
            return functions.setError(res, "Missing input value id news!", 404);
        let newsID = req.body.newsID;
        let fields = req.info;
        fields.updateTime = Date(Date.now());
        let existsNews = await News.findOne({ _id: newsID });
        if (existsNews) {
            await News.findOneAndUpdate({ _id: newsID }, fields);
            return functions.success(res, "News edited successfully");
        }
        return functions.setError(res, "News not found!", 505);
    } catch (err) {
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.deleteNews = async (req, res, next) => {
    try {
        let newsID = Number(req.query.newsID);
        if (newsID) {
            let news = await functions.getDataDeleteOne(News, { _id: newsID });
            if (news.deletedCount === 1) {
                return functions.success(res, `Delete news with _id=${newsID} success`);
            } else {
                return functions.success(res, "News not found");
            }
        }
        return functions.setError(res, "Missing input newsID", 500);
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}

//---------------------------------------------------------controller quan ly bang gia-----------------------------------------------

//api lay ra danh sach va tim kiem tin
exports.getListPriceList = async (req, res, next) => {
    try {
        //lay cac tham so dieu kien tim kiem tin
        let request = req.body;
        let _id = request._id,
            time = request.time,
            type = request.type

        let condition = {};
        if (_id) condition._id = Number(_id);
        if (type) condition.type = Number(type);
        if (time) condition.time = new RegExp(time);
        let fields = { _id: 1, time: 1, unitPrice: 1, discount: 1, intoMoney: 1, vat: 1, intoMoneyVat: 1 };

        let listPriceList = await PriceList.find(condition, fields);
        return functions.success(res, 'Get list PriceList success', { data: listPriceList })
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

exports.update = async (req, res, next) => {
    try {
        if (!req.body.newsID)
            return functions.setError(res, "Missing input value id news!", 404);
        let newsID = req.body.newsID;
        let fields = req.info;
        fields.updateTime = Date(Date.now());
        let existsNews = await News.findOne({ _id: newsID });
        if (existsNews) {

            await News.findOneAndUpdate({ _id: newsID }, fields);
            return functions.success(res, "News edited successfully");
        }
        return functions.setError(res, "News not found!", 505);
    } catch (err) {
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}


//-------------------------------------------------------controller quan ly tai khoan(da xac nhan opt va chua xac nhan)tk gian hang-------------------------

exports.getListUser = async (req, res, next) => {
    try {
        //lay cac tham so dieu kien tim kiem tin
        let request = req.body;
        let authentic = request.authentic,// phan biet tai khoan bt va tk gian hang(xac thuc va chua xac thuc)
            _id = request._id,
            userName = request.userName,
            email = request.email,
            phoneTK = request.phoneTK,
            fromDate = request.fromDate,
            toDate = request.toDate,
            page = request.page,
            pageSize = request.pageSize;
        //
        if (!page) {
            return functions.setError(res, "Missing input page", 401);
        }
        if (!pageSize) {
            return functions.setError(res, "Missing input pageSize", 402);
        }
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;

        //
        let condition = {};
        if (_id) condition._id = Number(_id);
        if (authentic) condition.authentic = Number(authentic);
        if (userName) condition.userName = new RegExp(userName);
        if (email) condition.email = new RegExp(email);
        if (phoneTK) condition.phoneTK = new RegExp(phoneTK);
        // tu ngay den ngay
        if (fromDate) {
            condition.updatedAt = { $gte: new Date(fromDate) }
        }
        if (toDate) {
            condition.updatedAt = { $lte: new Date(toDate) };
        }

        let fields = { avatarUser: 1, _id: 1, userName: 1, email: 1, phoneTK: 1, createdAt: 1, money: 1 };

        let listUsers = await functions.pageFindWithFields(Users, condition, fields, skip, limit);
        const totalCount = await Users.countDocuments(condition);
        return functions.success(res, 'Get list news success', { totalCount, listUsers })
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}


exports.getAndCheckDataUser = async (req, res, next) => {
    try {
        let { userName, email, phoneTK, phone, money, cong, tru } = req.body;

        if (!userName || !phoneTK) {
            return functions.setError(res, "Missing input value", 404)
        }
        // them cac truong muon them hoac sua
        req.info = {
            userName: userName,
            phoneTK: phoneTK,
            email: email,
            phone: phone,
            money: Number(money) + Number(cong) - Number(tru)
        }
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.createUser = async (req, res, next) => {
    try {
        let fields = req.info;
        const maxIdUser = await Users.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
        let newIdUser;
        if (maxIdUser) {
            newIdUser = Number(maxIdUser._id) + 1;
        } else newIdUser = 1;
        fields._id = newIdUser;
        fields.createdAt = Date(Date.now());
        let news = new Users(fields);
        await news.save();
        return functions.success(res, 'Create news RN365 success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        if (!req.body.userID)
            return functions.setError(res, "Missing input value id user!", 404);
        let userID = req.body.userID;
        let fields = req.info;
        fields.updateAt = Date(Date.now());
        let existsUser = await Users.findOne({ _id: userID });
        if (existsUser) {

            await Users.findOneAndUpdate({ _id: userID }, fields);
            return functions.success(res, "User edited successfully");
        }
        return functions.setError(res, "User not found!", 505);
    } catch (err) {
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        let userID = Number(req.query.userID);
        if (userID) {
            let user = await functions.getDataDeleteOne(Users, { _id: userID });
            if (user.deletedCount === 1) {
                return functions.success(res, `Delete user with _id=${userID} success`);
            } else {
                return functions.success(res, "User not found");
            }
        }
        return functions.setError(res, "Missing input userID", 500);
    } catch (e) {
        console.log("Error from server", e);
        return functions.setError(res, "Error from server", 500);
    }
}


//-------------------------------------------------------controller lich su nap the -------------------------

exports.getListHistory = async (req, res, next) => {
    try {
        //lay cac tham so dieu kien tim kiem tin
        let { page, pageSize, _id, userName, userId, seri, fromDate, toDate } = req.body;
        if (!page) {
            return functions.setError(res, "Missing input page", 401);
        }
        if (!pageSize) {
            return functions.setError(res, "Missing input pageSize", 402);
        }
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        //lay cac tham so dieu kien tim kiem tin

        let condition = {};

        // tu ngay den ngay
        if (fromDate) {
            condition.createTime = { $gte: new Date(fromDate) }
        }
        if (toDate) {
            condition.createTime = { $lte: new Date(toDate) };
        }

        if (_id) condition._id = Number(_id);
        if (userName) condition.userName = new RegExp(userName);
        if (userId) condition.userId = new Number(userId);
        if (seri) condition.seri = new RegExp(seri);
        let fields = { _id: 1, userId: 1, seri: 1, time: 1, price: 1 };
        let listHistory = await History.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: "Users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "matchedDocuments"
                }
            },
            // {$project: fields},
            { $sort: { _id: 1 } },
            { $skip: skip },
            { $limit: limit }
        ])
        const totalCount = await News.countDocuments(condition);
        return functions.success(res, 'Get list history success', { totalCount, listHistory })
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}


//-------------------------------------------------------controller quan ly blog -------------------------

exports.getListBlog = async (req, res, next) => {
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
            let title = req.body.title;
            let blogId = req.body.blogId;
            let listCondition = {};

            // dua dieu kien vao ob listCondition
            if (title) listCondition.title = new RegExp(title);
            if (blogId) listCondition._id = Number(blogId);
            let fieldsGet =
            {
                adminId: 1, langId: 1, title: 1, url: 1, image: 1, keyword: 1, sapo: 1, des: 1, detailDes: 1,
                date: 1, adminEdit: 1, dateLastEdit: 1, order: 1, active: 1, new: 1, hot: 1, titleRelate: 1, contentRelate: 1
            }
            const listBlog = await functions.pageFindWithFields(Blog, listCondition, fieldsGet, { _id: 1 }, skip, limit);
            const totalCount = await functions.findCount(Blog, listCondition);
            return functions.success(res, "get list blog success", { totalCount: totalCount, data: listBlog });
        } else {
            return functions.setError(res, "Missing input data", 400);
        }
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}

exports.getAndCheckDataBlog = async (req, res, next) => {
    try {
        let image = req.files.image;
        let { adminId, title, url, des, keyword, sapo, active, hot, detailDes, titleRelate, contentRelate, newStatus, date, dateLastEdit } = req.body;
        let fields = [adminId, title, url, image, des, keyword, sapo, detailDes, titleRelate, contentRelate];
        for (let i = 0; i < fields.length; i++) {
            if (!fields[i])
                return functions.setError(res, `Missing input value ${i + 1}`, 404);
        }
        // them cac truong muon them hoac sua
        req.info = {
            adminId: adminId,
            title: title,
            url: url,
            image: image,
            des: des,
            keyword: keyword,
            sapo: sapo,
            active: active,
            hot: hot,
            new: newStatus,
            detailDes: detailDes,
            titleRelate: titleRelate,
            contentRelate: contentRelate,
            date: date,
            dateLastEdit: dateLastEdit
        }
        return next();
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}


//admin tạo 1 blog
exports.createBlog = async (req, res, next) => {
    try {
        let fields = req.info;
        const maxIdBlog = await Blog.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
        let newIdBlog;
        if (maxIdBlog) {
            newIdBlog = Number(maxIdBlog._id) + 1;
        } else newIdBlog = 1;
        fields._id = newIdBlog;

        if (!fields.date) {
            fields.date = Date(Date.now());
        }
        //luu anh
        let image = fields.image;
        if (!await functions.checkImage(image.path)) {
            return functions.setError(res, 'ảnh sai định dạng hoặc lớn hơn 2MB', 405);
        }
        serviceRN.uploadFileRN2(folderImg, newIdBlog, image);
        fields.image = serviceRN.createLinkFileRaonhanh(folderImg, newIdBlog, image.name);
        let blog = new Blog(fields);
        await blog.save();
        return functions.success(res, 'Create blog RN365 success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

exports.updateBlog = async (req, res, next) => {
    try {
        if (!req.body._id)
            return functions.setError(res, "Missing input value id blog!", 404);
        let _id = req.body._id;
        let fields = req.info;
        if (!fields.dateLastEdit) {
            fields.dateLastEdit = Date(Date.now());
        }
        let image = fields.image;
        if (!await functions.checkImage(image.path)) {
            return functions.setError(res, 'ảnh sai định dạng hoặc lớn hơn 2MB', 405);
        }
        let existsBlog = await Blog.findOne({ _id: _id });
        if (existsBlog) {
            // xu ly anh
            let linkImg = existsBlog.image.split("/");
            let len = linkImg.length;
            // functions.deleteImgRaoNhanh(folderImg, linkImg[len-2], linkImg[len-1]);
            serviceRN.uploadFileRN2(folderImg, _id, image);
            fields.image = serviceRN.createLinkFileRaonhanh(folderImg, _id, image.name);

            //cap nhat du lieu
            await Blog.findByIdAndUpdate(_id, fields);
            return functions.success(res, "Blog edited successfully");
        }

        return functions.setError(res, "Blog not found!", 505);
    } catch (err) {
        console.log("Err from server!", err);
        return functions.setError(res, "Err from server!", 500);
    }
}


//-------------------------------------------------------controller giá ghim tin đăng -------------------------
//api danh sách và tìm kiếm giá ghim tin đăng
exports.getListNewWithPin = async (req, res, next) => {
    try {
        if (req.body) {
            const { _id, time, type } = req.body;
            let query = {};
            if (_id) {
                query._id = _id;
            }
            if (time) {
                query.time = time;
            }
            if (type && [1, 5, 3, 4].includes(type)) {
                query.type = type;
            }
            const priceList = await PriceList.find(query);
            return functions.success(res, 'Get List Search New With Pin', { data: priceList })
        } else {
            const typeList = [1, 5, 3, 4];
            const priceList = await PriceList.find({ type: { $in: typeList } });
            return functions.success(res, 'Get ListNewWithPin', { data: priceList })
        }
    } catch (error) {
        console.error(error);
        return functions.setError(res, error)
    }
}
//api tạo mới ghim tin đăng
exports.createNewWithPin = async (req, res, next) => {
    try {
        const {
            time,
            unitPrice,
            discount,
            intoMoney,
            vat,
            intoMoneyVat,
            type,
            cardGift,
            newNumber
        } = req.body;
        if (![1, 5, 3, 4].includes(Number(type))) {
            // kiểm tra có phải loại ghim tin
            return res.status(400).json({ message: 'Type not vaild' });
        }
        // kiểm tra các trường cần phải cos
        if (typeof discount === "number" && typeof vat === "number"
            && typeof type === "number" && typeof newNumber === "number" && _id !== null && cardGift !== null) {
            // check tồn tại sản phẩm id lớn nất
            const maxIdCategory = await PriceListRN.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
            // tăng id lên 1 đơn vị
            let _id;
            if (maxIdCategory) {
                _id = Number(maxIdCategory._id) + 1;
            } else _id = 1;
            // tạo mới tin ghim tin đăng
            const newPriceList = new PriceListRN({
                _id,
                time,
                unitPrice,
                discount,
                intoMoney,
                vat,
                intoMoneyVat,
                type,
                cardGift,
                newNumber
            });
            const savedPriceList = await newPriceList.save();
            return functions.success(res, 'Create Success', { data: savedPriceList })
        } else {
            return functions.setError(res, 'The input No Vaild', 400);
        }
    } catch (error) {
        console.log(error);
        return functions.setError(res, err)
    }
}

// api sửa ghim tin đăng
exports.putNewWithPin = async (req, res, next) => {
    let { id } = req.body;
    const {
        time,
        unitPrice,
        discount,
        intoMoney,
        vat,
        intoMoneyVat,
        cardGift,
        newNumber
    } = req.body;
    try {
        const priceList = await PriceList.findById(id);
        if (!priceList) {
            return res.status(404).json({ message: '_id is notExist' });
        }
        if (typeof discount === "number" && typeof vat === "number"
            && typeof type === "number" && typeof newNumber === "number" && _id !== null && cardGift !== null) {
            priceList.time = time;
            priceList.unitPrice = unitPrice;
            priceList.discount = discount;
            priceList.intoMoney = intoMoney;
            priceList.vat = vat;
            priceList.intoMoneyVat = intoMoneyVat;
            priceList.cardGift = cardGift;
            priceList.newNumber = newNumber;
            const updatedPriceList = await priceList.save();
            return functions.success(res, 'Put Success', { data: updatedPriceList })
        } else {
            return functions.setError(res, 'The input No Vaild', 400);
        }
    } catch (error) {
        console.error(error);
        return functions.setError(res, error)
    }
}


//-------------------------------------------------------controller giá đẩy tin đăng -------------------------
// api danh sách và tìm kiếm đẩy tin đăng
exports.getListPricePush = async (req, res, next) => {
    try {
        let condition = { type: 2 };
        let id = req.body.id;
        let loaiTin = req.body.loaiTin;
        if (id) condition._id = id;
        if (loaiTin) condition.time = { $regex: `.*${loaiTin}.*` }
        let data = await PriceList.find(condition, {}, { unitPrice: 1 })
        return functions.success(res, 'Get List New With Push', { data })
    }
    catch (error) {
        return functions.setError(res, error)
    }
}

//api tạo mới đẩy tin đăng
exports.createNewWithPush = async (req, res, next) => {
    try {
        const {
            time,
            unitPrice,
            discount,
            intoMoney,
            vat,
            intoMoneyVat,
            type = 2,
            cardGift,
            newNumber
        } = req.body;
        if (typeof discount === "number" && typeof vat === "number"
            && typeof type === "number" && typeof newNumber === "number" && _id !== null && cardGift !== null) {
            // check tồn tại sản phẩm id lớn nất
            const maxIdCategory = await PriceListRN.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
            let _id;
            // nếu tồn tại tăng 1 đơn vị
            if (maxIdCategory) {
                _id = Number(maxIdCategory._id) + 1;
            } else _id = 1;
            // tạo mới tin ghim tin đăng
            const newPriceList = new PriceListRN({
                _id,
                time,
                unitPrice,
                discount,
                intoMoney,
                vat,
                intoMoneyVat,
                type,
                cardGift,
                newNumber
            });
            const savedPriceList = await newPriceList.save();
            return functions.success(res, 'Create Success', { data: savedPriceList })
        }
        else {
            return functions.setError(res, 'The input No Vaild', 400);
        }
    } catch (error) {
        console.error(error);
        return functions.setError(res, error)
    }
}




// tạo mới
exports.createReport = async (req, res, next) => {
    try {
        const reportNewsData = req.body;
        console.log(reportNewsData)
        const newReportNews = new ReportNews(reportNewsData);
        const savedReportNews = await newReportNews.save();
        console.log(savedReportNews)
        res.status(201).json(savedReportNews);
    } catch (error) {
        return functions.setError(res, error)
    }
}
// api danh sách tìm kiếm tin báo cáo
exports.listReportNew = async (req, res, next) => {
    try {
        let condition = {};
        let id_user = req.body.id_user;
        let userName = req.body.userName;
        let problem = req.body.problem;
        let thoiGianTu = req.body.thoiGianTu;
        let thoiGianDen = req.body.thoiGianDen;
        let page = req.body.page || 1;
        let pageSize = req.body.pageSize || 30;
        let skip = (page - 1) * pageSize;
        let limit = pageSize;
        if (id_user) condition.id_user = id_user;
        if (thoiGianTu) condition.time = { $gte: new Date(thoiGianTu) }
        if (thoiGianDen) condition.time = { $lte: new Date(thoiGianDen) }
        if (thoiGianTu && thoiGianDen) condition.time = { $gte: new Date(thoiGianTu), $lte: new Date(thoiGianDen) }
        if (userName) condition['user.userName'] = userName;
        if (problem) condition.problem = problem;

        let data = await NewReport.aggregate([
            {
                $lookup: {
                    from: 'Users',
                    localField: 'id_user',
                    foreignField: 'idRaoNhanh365',
                    as: 'user'
                }
            }, {
                $match: condition
            }, {
                $skip: skip
            }, {
                $limit: limit
            }
        ])
        return functions.success(res, "get list report success", { data });
    } catch (error) {
        console.log("Err from server", error);
        return functions.setError(res, error)
    }
}
// api sửa tin báo cáo
exports.fixNewReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const Report = await ReportNews.findOneAndUpdate({ _id: id }, { fixed: 1 }, {
            new: true
        })
        return functions.success(res, "Fix report success", { data: Report });
    } catch (error) {
        console.log("Err from server", error);
        return functions.setError(res, error)
    }
}
//-------------------------------------------------------API chiet khau nap the-------------------------
// tạo
exports.createDiscount = async (req, res, next) => {
    try {
        const reportNewsData = req.body;
        console.log(reportNewsData)
        const newReportNews = new NetworkOperator(reportNewsData);
        const savedReportNews = await newReportNews.save();
        console.log(savedReportNews)
        res.status(201).json(savedReportNews);
    } catch (error) {
        return functions.setError(res, error)
    }
}
// api tìm kiếm và danh sách chiết khấu
exports.getListDiscountCard = async (req, res, next) => {
    try {
        let page = req.body.page || 1;
        let pageSize = req.body.pageSize || 50;
        let skip = (page - 1) * pageSize;
        let limit = pageSize;
        let conditions = { priceListActive: 1 };
        let count = await NetworkOperator.find(conditions, {}).skip(skip).limit(limit).count();
        let data = await NetworkOperator.find(conditions).sort({ _id: 1 }).skip(skip).limit(limit);
        return functions.success(res, "Get List Report Success", { count, data });
    } catch (error) {
        return functions.setError(res, error)
    }
}
// api update Discount for Card
exports.updateDiscount = async (req, res, next) => {
    try {
        let { id } = req.params;
        let { nameBefore, nameAfter, discount } = req.body;
        //  nếu có param Id thì trả ra thông tin để sưả
        if (id && !nameBefore) {
            console.log(1)
            const netWorkOperator = await NetworkOperator.findOne({ _id: id })
            return functions.success(res, "Get Data", { data: netWorkOperator });
        } else if (id && nameBefore && nameAfter && discount) {

            const update = {
                nameBefore: nameBefore,
                nameAfter: nameAfter,
                discount: discount
            }
            const upDateDiscount = await NetworkOperator.findOneAndUpdate({ _id: id }, update, {
                new: true
            })
            return functions.success(res, "Update Discount Success", { data: upDateDiscount });
        }
    } catch (error) {
        return functions.setError(res, error)
    }
}

exports.failRegisterUser = async (req, res, next) => {
    try {
        let page = req.body.page;
        let pageSize = req.body.pageSize;
        let skip = (page - 1) * pageSize;
        let limit = pageSize;
        let id = req.body.id;
        let thoiGianTu = req.body.thoiGianTu;
        let thoiGianDen = req.body.thoiGianDen;
        let condition = {};
        if (id) condition._id = id;
        if (thoiGianTu) condition.time = { $gte: new Date(thoiGianTu) }
        if (thoiGianDen) condition.time = { $lte: new Date(thoiGianDen) }
        if (thoiGianTu && thoiGianDen) condition.time = { $gte: new Date(thoiGianTu), $lte: new Date(thoiGianDen) }
        let count = await RegisterFail.find(condition, {}).count();
        let data = await RegisterFail.find(condition, {}).skip(skip).limit(limit)
        return functions.success(res, "get data success", { count, data })
    } catch (error) {
        return functions.setError(res, error)
    }
}

exports.getInfoForEdit = async (req, res, next) => {
    try {
        let model = req.body.model;
        let _id = req.body._id;
        let data = {};
        switch (model) {
            case 'Users':
                data = await Users.findById({ _id })
                break;
                
            case 'New':
                data = await functions.getDatafind(New, { _id })
                break;
            case 'Order':
                data = await Order.findById({_id});
        }
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.log("🚀 ~ file: admin.js:1156 ~ exports.getInfoForEdit= ~ error:", error)
        return functions.setError(res, error)
    }
}

exports.active = async (req,res,next) =>{
    
}