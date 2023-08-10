const User = require("../../models/qlcnew/user");
const fn = require("../../services/functions");
const utils = require("../../services/qlcnew/utils");
const Application = require("../../models/qlcnew/application");

async function createUser(req, res, is_verified = false) {
    let {
        com_id,
        first_name,
        last_name,

        phone_number,
        contact_email,
        date_of_birth,
        gender,
        address,
        img_url,

        is_user,
        is_employee,

        user_email,

        em_id,
        com_email,

        work_unit_id,
        position_id,
        work_trial_start,
        work_official_start,
        work_status,

    } = req.body;



    if (!first_name || !last_name ||
        is_user && !user_email ||
        is_employee && (!em_id || !work_unit_id || !position_id) ||
        !work_status)
        return { success: false, msg: "Required values are missing!" };


    let maxID = await fn.getMaxID(User);
    let _id = 0;
    if (maxID || maxID === 0) {
        _id = maxID + 1;
    }


    const createdDoc = new User({
        _id: _id,
        com_id: com_id,
        profile: {
            first_name: first_name,
            last_name: last_name,
            phone_number: phone_number,
            contact_email: contact_email,
            date_of_birth: date_of_birth,
            gender: gender,
            address: address,
            img_url: img_url,
        },
        is_user: is_user,
        is_employee: is_employee,
        user_email: user_email,
        em_id: em_id,
        com_email: com_email,
        work_unit_id: work_unit_id,
        position_id: position_id,
        work_trial_start: work_trial_start,
        work_official_start: work_official_start,
        work_status: work_status,
        is_verified: is_verified
    });
    return { success: true, data: await createdDoc.save() };
}

exports.create = async (req, res) => {
    try {
        const created = await createUser(req, res)

        console.log(created)

        if (created.success) {
            return fn.success(res, "Successfully created new User", created.data._doc);
        } else {
            return fn.setError(res, created.msg);
        }

    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:create: ", error);
        return fn.setError(res, error.message);
    }
}

exports.createVerified = async (req, res) => {
    try {
        const created = await createUser(req, res)

        console.log(created)

        if (created.success) {
            return fn.success(res, "Successfully created new Verified User", created.data._doc);
        } else {
            return utils.errorFieldsMissing(res, created.msg);
        }

    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:createVerified: ", error);
        return fn.setError(res, error.message);
    }
}

exports.verifyUser = async (req, res) => {
    try {
        let {
            _id
        } = req.body;

        if (!_id) return utils.errorIdMissing(res);

        let doc = await User.findByIdAndUpdate(_id, { is_verified: true });

        if (!doc) return utils.errorNotFound(res);

        return fn.success(res, "Successfully verified User");
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:verifyUser: ", error);
        return fn.setError(res, error.message);
    }
}

exports.deleteUser = async (req, res) => {
    try {
        let {
            id
        } = req.params;

        if (!id) return utils.errorIdMissing(res);

        let doc = await User.findByIdAndDelete(id, { is_deleted: true });

        if (!doc) return utils.errorNotFound(res);

        return fn.success(res, "Successfully deleted User");

    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:deleteUser: ", error);
        return fn.setError(res, error.message);
    }
}

exports.changeWorkUnit = async (req, res) => {
    try {
        let _id = req.params.id;
        const work_unit_id = req.body.work_unit_id;
        if (!_id) return utils.errorIdMissing(res);
        if (!work_unit_id) return utils.errorFieldsMissing(res);

        let doc = await fn.getDatafindOneAndUpdate(User, { _id: _id }, { work_unit_id: work_unit_id });
        if (!doc) return utils.errorNotFound(res);

        const edited = await User.findById(doc._id);

        return fn.success(res, "Successfully changed work unit for User", { data: edited._doc });


    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:changeWorkUnit: ", error);
        return fn.setError(res, error.message);
    }
}

exports.setSuperadmin = async (req, res) => {
    try {
        let {
            _id,
            is_superadmin
        } = req.body;

        if (!_id) return utils.errorIdMissing(res);
        if (!is_superadmin) return utils.errorFieldsMissing(res);

        let doc = await User.findByIdAndUpdate(_id, {
            is_superadmin: is_superadmin,
        })
        if (!doc) return utils.errorNotFound(res);

        const edited = await User.findById(doc._id);

        return fn.success(res, "Successfully changed work unit for User", { data: edited._doc });


    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:changeWorkUnit: ", error);
        return fn.setError(res, error.message);
    }
}

exports.editUser = async (req, res) => {
    try {
        const _id = req.params.id;
        let {

            com_id,
            first_name,
            last_name,

            phone_number,
            contact_email,
            date_of_birth,
            gender,
            address,
            img_url,

            is_user,
            is_employee,

            user_email,
            is_verified,
            em_id,
            com_email,

            work_unit_id,
            position_id,
            work_trial_start,
            work_official_start,
            work_status,

        } = req.body;

        if (!_id) return utils.errorIdMissing(res);

        let doc = await User.findByIdAndUpdate(_id, {
            com_id: com_id,
            profile: {
                first_name: first_name,
                last_name: last_name,
                phone_number: phone_number,
                contact_email: contact_email,
                date_of_birth: date_of_birth,
                gender: gender,
                address: address,
                img_url: img_url,
            },
            is_user: is_user,
            is_employee: is_employee,
            user_email: user_email,
            em_id: em_id,
            com_email: com_email,
            work_unit_id: work_unit_id,
            position_id: position_id,
            work_trial_start: work_trial_start,
            work_official_start: work_official_start,
            work_status: work_status,
            is_verified: is_verified
        })
        if (!doc) return utils.errorNotFound();

        const edited = await User.findById(doc._id);

        return fn.success(res, "Successfully edited User", { data: edited._doc });
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:editUser: ", error);
        return fn.setError(res, error.message);
    }
}

exports.getAll = async (req, res) => {
    try {
        let docs = await User.find({ is_deleted: false });
        return fn.success(res, "Successfully retrieved all User", docs);
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:editUser: ", error);
        return fn.setError(res, error.message);
    }
}


exports.getAllUserOfCompany = async (req, res) => {

    try {
        const com_id = req.params.com_id; // Lấy id của công ty từ đường dẫn (URL)

        // Kiểm tra xem id của công ty có phải là số hay không
        if (isNaN(com_id)) {
            return fn.setError(res, "Company id must be a number");
        }

        const data = await fn.getDatafind(User, { com_id: com_id });
        if (data) {
            return fn.success(res, 'Lấy danh sách người dùng của công ty thành công', { data });
        } else {
            return fn.setError(res, 'Không có dữ liệu', 404);
        }
    } catch (err) {
        fn.setError(res, err.message);
    }
};

exports.getUserById = async (req, res) => {
    try {
        let {
            id
        } = req.params;
        if (!id) return utils.errorIdMissing(res);
        let doc = await User.findById(id);
        if (!doc) return utils.errorNotFound(res);
        return fn.success(res, "Successfully retrieved all User", { data: doc._doc });
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/user:editUser: ", error);
        return fn.setError(res, error.message);
    }
}
exports.applyNewCompany = async (req, res) => {
    const _id = req.params.id;
    const com_id = req.body.com_id;
    try {

        const user = await User.findById(_id);
        if (!com_id) {
            return fn.setError(res, "Required field 'com_id' is missing!");
        }
        if (!user.is_approved) {
            return fn.setError(res, "Your request is still pending approval. Please wait until it's approved.");
        }

        const updatedUser = await fn.getDatafindOneAndUpdate(User, { _id: _id }, { com_id: com_id });
        if (!updatedUser) {
            return utils.errorNotFound(res, "User not found!");
        }

        return fn.success(res, "Your job application has been submitted successfully. Please wait for company approval.", { user });


    } catch (error) {
        console.log("[ERR]: Error while processing job application: ", error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your job application.' });
    }
}
exports.aceptUserRequest = async (req, res) => {
    try {
        const _id = req.params.id;
        const com_id = req.body.com_id;
        const user = await User.findById(_id);
        if (!user) {
            return utils.errorNotFound(res, "User not found!");
        }
        // user.is_approved = true;
        if (com_id) {
            // Cập nhật com_id của người dùng thành _id của công ty
            user.com_id = com_id;
        }

        await user.save();
        return fn.success(res, "User request has been approved!", { user });
    }
    catch (error) {
        console.log("[ERR]: Error while accepting user request: ", error);
        return fn.setError(res, error.message);

    }
}

//Cấp quyền cho nhân viên truy cập vào app
exports.updateAppPermission = async (req, res) => {
    const id = req.params.id; // Lấy ID của người dùng từ URL
    const applicationId = req.body._id;
    try {

        // Kiểm tra xem applicationId có tồn tại hay không
       
        const foundApplication = await Application.findById(applicationId);
        if (!foundApplication) {
            return res.status(404).json({ message: 'Application not found' });
        }
        const updatedUser = await User.findByIdAndUpdate(id, { $addToSet: { applications: applicationId } }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // console.log('User updated:', updatedUser);

        return fn.success(res, "Permission added successfully!", { User });

    } catch (error) {
        console.error('Error:', err);
        return fn.setError(res, error.message);


    }
};




