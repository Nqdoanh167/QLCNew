const User = require("../../models/qlcnew/user");
const fn = require("../../services/functions");
const utils = require("../../services/qlcnew/utils");
const Application = require("../../models/qlcnew/application");

async function createApp(req, res) {
    let {
        name
    } = req.body;

    let maxId = await fn.getMaxID(Application);
    let _id = 0;
    if (maxId || maxId === 0) {
        _id = maxId + 1;
    }

    const createdDoc = new Application({
        _id: _id,
        name: name,

    });
    return { success: true, data: await createdDoc.save() };
}

exports.createApps = async (req, res) => {
    try {
        const created = await createApp(req, res)

        console.log(created)

        if (created.success) {
            return fn.success(res, "Successfully created new App", created.data._doc);
        } else {
            return fn.setError(res, created.msg);
        }

    } catch (error) {
        console.log("[ERR]: controllers/qlcnew/application:create: ", error);
        return fn.setError(res, error.message);
    }
}

exports.getAllApps = async (req, res) => {
    await fn.getDatafind(Application, {})
        .then((apps) => fn.success(res, "Get data successfully", apps))
        .catch((err) => fn.setError(res, err.message))
}