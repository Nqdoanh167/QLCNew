const LevelCompany = require("../../models/qlcnew/level_company");
const fn = require("../../services/functions");

exports.create = async(req, res) => {
    try {

        let {
            com_id,
            level,
            name,
        } = req.body;


        if (!com_id || !level || !name)
            return fn.setError(res, "Field values are invalid!");

        const count = await LevelCompany.find({}).count();
        if (level > count + 2) level = count + 1;
        if (level < 1) level = 1;
        let maxID = await fn.getMaxID(LevelCompany);
        let _id = 0;
        if (maxID || maxID === 0) {
            _id = maxID + 1;
        }

        /**Cập nhật cấp quyền hạn chèn thêm khi tạo thêm người dùng có quyền hạn cao hơn
         * Behavior: Nếu CompanyLevel nhỏ hơn hoặc bằng đối tượng được thêm vào thì
         * những level nhỏ hơn sẽ +1 
         */
        await LevelCompany.updateMany({ com_id: com_id, level: { $gte: level } }, { $inc: { level: 1 } });
        const createdDoc = new LevelCompany({
            _id: _id,
            com_id: com_id,
            level: level,
            name: name,
        });
        const savedDoc = await createdDoc.save();

        return fn.success(res, "Successfully created new LevelCompany", { data: savedDoc._doc });

    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/level_company:create: ", error);
        return fn.setError(res, error.message);
    }
}

exports.getAll = async(req, res) => {
    try {
        const docs = await LevelCompany.find({});
        return fn.success(res, "Successfully retrieved all LevelCompany", docs);
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/level_company:getAll: ", error);
        return fn.setError(res, error.message);
    }
}

exports.getById = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id) return fn.setError(res, "No valid ID!");

        const doc = await LevelCompany.findOne({ _id: id });
        if (!doc) return fn.setError(res, "Not Found!");

        return fn.success(res, "Successfully retrieved LevelCompany", { data: doc._doc });
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/level_company:getById: ", error);
        return fn.setError(res, error.message);
    }
}

exports.getByComId = async(req, res) => {
    try {
        const { com_id } = req.params;
        if (!com_id) return fn.setError(res, "No valid com_id!");

        const docs = await LevelCompany.find({ com_id: com_id });
        return fn.success(res, "Successfully retrieved LevelCompany", docs);
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/level_company:getById: ", error);
        return fn.setError(res, error.message);
    }
}

exports.edit = async(req, res) => {
    try {

        const {
            _id,
            com_id,
            level,
            name,
        } = req.body;

        if (!_id)
            return fn.setError(res, "No valid id");

        const doc = await LevelCompany.findOne({ _id: _id });
        if (!doc) return fn.setError(res, "Not Found!");
        if (com_id) {
            doc.com_id = com_id;
        }

        if (level !== doc.level) {
            if (level > doc.level) {
                await LevelCompany.updateMany({ com_id: doc.com_id, level: { $gt: doc.level, $lte: level } }, { $inc: { level: -1 } });
            } else {
                await LevelCompany.updateMany({ com_id: doc.com_id, level: { $gte: level, $lt: doc.level } }, { $inc: { level: 1 } });
            }
        };

        await LevelCompany.findByIdAndUpdate(_id, {
            com_id: com_id,
            level: level,
            name: name,
        });

        return fn.success(res, "Successfully edited LevelCompany", {
            data: {
                _id: _id,
                com_id: com_id,
                level: level,
                name: name,
            }
        });

    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/level_company:edit: ", error);
        return fn.setError(res, error.message);
    }
}

exports.transplaceLevel = async(req, res) => {
    try {
        const {
            from_id,
            to_id
        } = req.body;
        let fromDoc = await LevelCompany.findById(from_id);
        let toDoc = await LevelCompany.findById(to_id);

        if (!fromDoc || !toDoc) return fn.setError(res, "Not Found");
        if (!fromDoc.com_id !== !toDoc.com_id) return fn.setError(res, "Transplace is only supported within a company");

        await LevelCompany.findByIdAndUpdate(from_id, { level: toDoc.level });
        await LevelCompany.findByIdAndUpdate(to_id, { level: fromDoc.level });

        return fn.success(res, "Successfully transplaced (2) LevelCompany");
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/level_company:transplaceLevel: ", error);
        return fn.setError(res, error.message);
    }
}

exports.deletePermanently = async(req, res) => {
    try {
        console.log(req.params)
        const { id } = req.params;
        if (!id)
            return fn.setError(res, "No valid id");


        let deleted = await LevelCompany.findByIdAndDelete(id);
        if (!deleted) return fn.setError(res, "Not Found!");

        await LevelCompany.updateMany({ com_id: deleted.com_id, level: { $gte: deleted._doc.level } }, { $inc: { level: -1 } });

        return fn.success(res, "Successfully deleted LevelCompany", { data: deleted._doc });
    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/level_company:deletePermanently: ", error);
        return fn.setError(res, error.message);
    }
}