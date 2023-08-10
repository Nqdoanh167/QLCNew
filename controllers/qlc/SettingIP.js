const functions = require("../../services/functions")
const setIp = require("../../models/qlc/SettingIP")



//lấy danh sách 

exports.getListByID = async(req, res) => {
        try {
            const _id = req.body.id || null;
            const com_id = req.body.com_id;
            let condition = {}
            if (!com_id) {
                functions.setError(res, "id required")
            } else if (isNaN(com_id)) {
                functions.setError(res, "id not a number")

            } else {
                if (_id) condition._id = _id
                if (com_id) condition.com_id = com_id
                console.log(_id, com_id)
                const data = await setIp.find(condition).select('_id fromSite accessIP createAt updateAt');
                console.log(data)
                if (!data) {
                    functions.setError(res, 'not found')
                } else {
                    functions.success(res, 'found successfull', { data })
                }
            };
        } catch (error) {
            console.log(error);
            functions.setError(res, error.message);
        }
    }
    //tạo 1 thiết lập Ip
exports.createIP = async(req, res) => {
    const { com_id, accessIP, fromSite, createAt, updateAt } = req.body;
    // let nameApp = "";
    if ((accessIP && fromSite && com_id) == undefined) {
        functions.setError(res, "info required")
    } else if (isNaN(com_id)) {
        functions.setError(res, "fromSite must be a number")
    } else {
        const maxId = await functions.getMaxID(setIp);

        const _id = Number(maxId) + 1 || 1;
        const settingIP = new setIp({
            _id: _id,
            com_id: com_id,
            fromSite: fromSite,
            accessIP: accessIP,
            createAt: new Date().toJSON().slice(0, 10),
            updateAt: updateAt || null
        })
        await settingIP.save()
            .then(() => functions.success(res, 'create successful', { settingIP }))
            .catch((e) => functions.setError(res, e.message))
    }

}
exports.editsettingIP = async(req, res) => {
    const _id = req.body.id;
    console.log(_id)
    const { com_id, accessIP, fromSite, updateAt } = req.body;
    if ((accessIP && fromSite && com_id) == undefined) {
        functions.setError(res, "info required")
    } else if (isNaN(com_id)) {
        functions.setError(res, "com_id must be a number")
    } else {
        const settingIP = await functions.getDatafindOne(setIp, { com_id: com_id, _id: _id });
        if (!settingIP) {
            functions.setError(res, "setIp does not exist!");
        } else {
            await functions.getDatafindOneAndUpdate(setIp, { com_id: com_id, _id: _id }, {
                    fromSite: fromSite,
                    // nameApp: nameApp,
                    accessIP: accessIP,
                    updateAt: new Date(),
                })
                .then((settingIP) => functions.success(res, "setIp edited successfully", { settingIP }))
                .catch((err) => functions.setError(res, err.message));
        }
    }
}


exports.deleteSetIpByID = async(req, res) => {
    const com_id = req.body.com_id;
    const _id = req.body.id;
    // console.log(_id,com_id)

    if (!com_id) {
        functions.setError(res, "Company id required");
    } else if (isNaN(com_id)) {
        functions.setError(res, "Company id must be a number");
    } else {
        const settingIp = await functions.getDatafind(setIp, { com_id: com_id, _id: _id });
        // console.log(settingIp)
        if (!settingIp) {
            functions.setError(res, "No setIp found in this company");
        } else {
            await functions.getDataDeleteOne(setIp, { com_id: com_id, _id: _id })
                .then(() => functions.success(res, "setIp deleted successfully", { settingIp }))
                .catch((err) => functions.setError(res, err.message));
        }
    }



}