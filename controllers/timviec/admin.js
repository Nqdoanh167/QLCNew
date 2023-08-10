const md5 = require('md5');

const AdminUser = require('../../models/Timviec365/Admin/AdminUser');
const Modules = require('../../models/Timviec365/Admin/Modules');
const functions = require('../../services/functions');
const AdminUserRight = require('../../models/Timviec365/Admin/AdminUserRight')

// hàm lấy dữ liệu modules
exports.getModules = async(req, res, next) => {
    try {
        let modules = await functions.getDatafind(Modules);
        if (modules) {
            return functions.success(res, 'lấy dữ liệu thành công', modules)
        }
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
};

// Lấy thông tin admin qua trường id bộ phận và không cần đăng nhập
exports.getInfoAdminUser = async(req, res) => {
    const adm_bophan = req.body.adm_bophan;
    if (adm_bophan) {
        const admin = await AdminUser.findOne({ adm_bophan: adm_bophan }).lean();
        return functions.success(res, "Thông tin KD", { admin });
    }
    return functions.setError(res, "Chưa truyền adm_bophan");
}

// hàm đăng ký 
exports.postAdmin = async(req, res, next) => {
        try {
            let request = req.body,
                loginName = request.loginName,
                name = request.name,
                phone = request.phone,
                password = request.password,
                email = request.email,
                modules = request.modules,
                allCategory = request.allCategory,
                category = request.accessCategory,
                langID = requestlangID;
            if (loginName && name && phone && password && email) {
                let checkEmail = await functions.checkEmail(email);
                let checkPhone = await functions.checkPhoneNumber(phone);
                if (checkEmail && checkPhone) {
                    let admin = await functions.getDatafindOne(AdminUser, { loginName });
                    if (admin == null) {
                        let maxID = await functions.getMaxID(AdminUser) || 0;
                        if (category && category.length == 0) {
                            category = null;
                        }
                        if (modules && modules.length > 0) {
                            for (let i = 0; i < modules.length; i++) {
                                let maxIDModules = await functions.getMaxID(AdminUserRight) || 0;
                                let adminRight = new AdminUserRight({
                                    _id: Number(maxIDModules) + 1,
                                    adminID: Number(maxID) + 1,
                                    adminModule: modules[i].adminModule,
                                    add: modules[i].add,
                                    edit: modules[i].edit,
                                    delete: modules[i].delete,
                                })
                                await adminRight.save();
                            }
                        }
                        let adminUser = new AdminUser({
                            _id: Number(maxID) + 1,
                            loginName: loginName,
                            password: md5(password),
                            name: name,
                            email: email,
                            active: 0,
                            allCategory: allCategory || 0,
                            accessCategory: JSON.stringify(category) || null,
                            langID: langID || 1,
                        })
                        await adminUser.save();
                        return functions.success(res, 'thêm mới thành công')
                    }
                    return functions.setError(res, 'tên đăng nhập đã tồn tại', 404)
                }
                return functions.setError(res, 'email hoặc sô điện thoại không đúng định dạng', 404)
            }
            return functions.setError(res, 'không đủ dữ liệu', 404)
        } catch (error) {
            console.log(error)
            return functions.setError(res, error)
        }
    }
    // hàm cập nhập admin 
exports.updateAdmin = async(req, res, next) => {
        try {
            let idAdmin = req.user.data._id;
            let request = req.body,
                name = request.name,
                phone = request.phone,
                password = request.password,
                email = request.email,
                modules = request.modules,
                allCategory = request.allCategory,
                category = request.accessCategory;
            let checkAdmin = await functions.getDatafindOne(AdminUser, { _id: idAdmin });
            if (checkAdmin) {
                if (name && phone && password && email) {
                    let checkEmail = await functions.checkEmail(email);
                    let checkPhone = await functions.checkPhoneNumber(phone);
                    if (checkEmail && checkPhone) {
                        if (category && category.length == 0) {
                            category = null;
                        }
                        if (modules && modules.length > 0) {
                            await AdminUserRight.deleteMany({ adminID: idAdmin });
                            for (let i = 0; i < modules.length; i++) {
                                let maxIDModules = await functions.getMaxID(AdminUserRight) || 0;
                                let adminRight = new AdminUserRight({
                                    _id: Number(maxIDModules) + 1,
                                    adminID: idAdmin,
                                    adminModule: modules[i].adminModule,
                                    add: modules[i].add,
                                    edit: modules[i].edit,
                                    delete: modules[i].delete,
                                })
                                await adminRight.save();
                            }
                        }
                        await AdminUser.updateOne({ _id: idAdmin }, {
                            $set: {
                                loginName: loginName,
                                password: md5(password),
                                name: name,
                                email: email,
                                active: 0,
                                allCategory: allCategory || 0,
                                accessCategory: JSON.stringify(category) || null,
                            }
                        });
                        return functions.success(res, 'cập nhập thành công')
                    }
                    return functions.setError(res, 'email hoặc sô điện thoại không đúng định dạng', 404)
                }
                return functions.setError(res, 'không đủ dữ liệu', 404)
            }
            return functions.setError(res, 'tài khoản không tồn tại', 404)

        } catch (error) {
            console.log(error)
            return functions.setError(res, error)
        }
    }
    // hàm lấy thông tin chi tiết admin
exports.getAdminDetail = async(req, res, next) => {
    try {
        let id = req.user.data._id;
        if (idAdmin) {
            let admin = await functions.getDatafindOne(AdminUser, { _id: id });
            if (admin) {
                return functions.success(res, 'lấy dữ liệu thành công', admin)
            }
            return functions.setError(res, 'admin không tồn tại', 404)
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
};
// hàm lấy danh sách admin
exports.getListAdmin = async(req, res, next) => {
        try {
            let listADmin = await functions.getDatafind(AdminUser);
            return functions.success(res, 'lấy dữ liệu thành công', listADmin)

        } catch (error) {
            console.log(error)
            return functions.setError(res, error)
        }
    }
    // hàm xóa admin
exports.deleteAdmin = async(req, res, next) => {
        try {
            let id = req.user.data._id;
            if (id) {
                await AdminUser.deleteOne({ _id: id });
                let adminRight = await functions.getDatafind(AdminUserRight, { adminID: id })
                if (adminRight.length > 0) {
                    await AdminUserRight.deleteMany({ adminID: id });
                }
                return functions.success(res, 'xóa thành công')
            }
        } catch (error) {
            console.log(error)
            return functions.setError(res, error)
        }
    }
    // hàm cập nhập active
exports.updateActive = async(req, res, next) => {
        try {
            let id = req.user.data._id;
            let active = req.body.active;
            if (id) {
                let admin = await functions.getDatafindOne(AdminUser, { _id: id })
                if (admin) {
                    await AdminUser.updateOne({ _id: id }, {
                        $set: {
                            active: active,
                        }
                    });
                    return functions.success(res, 'cập nhập thành công')
                }
                return functions.setError(res, 'admin không tồn tại', 404)
            }
            return functions.setError(res, 'không đủ dữ liệu', 404)
        } catch (error) {
            console.log(error)
            return functions.setError(res, error)
        }
    }
    // hàm đổi mật khẩu 
exports.updatePassword = async(req, res, next) => {
    try {
        let id = req.user.data._id;
        let password = req.body.password;
        if (id) {
            let admin = await functions.getDatafindOne(AdminUser, { _id: id })
            if (admin) {
                await AdminUser.updateOne({ _id: id }, {
                    $set: {
                        password: md5(password),
                    }
                });
                return functions.success(res, 'cập nhập thành công')
            }
            return functions.setError(res, 'admin không tồn tại', 404)
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}