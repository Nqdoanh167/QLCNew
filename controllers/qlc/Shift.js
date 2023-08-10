const Shifts = require('../../models/qlc/Shifts');
const functions = require("../../services/functions");
//lấy danh sách ca làm việc
exports.getListShifts = async (req, res) => {
    await functions.getDatafind(Shifts, {})
        .then((shifts) => functions.success(res, "Get shift's data successfully", shifts))
        .catch(err => functions.setError(res, err.message, 620));
};
//lấy danh sách ca làm việc theo id
exports.getShiftById = async (req, res) => {

    const _id = req.body.id;
    const companyID = req.body.companyID
    if((_id && companyID) == undefined){
        functions.setError(res, "input required", 621);
    }else if (isNaN(_id && companyID)) {
        functions.setError(res, "Id must be a number", 621);
    } else {
        const shift = await functions.getDatafindOne(Shifts, { _id: _id, companyID:companyID });
        if (shift) {
            functions.success(res, "Get data successfully", shift);
        } else {
            functions.setError(res, "Shifts cannot be found or does not exist", 622);
        }
    }
};
//API lấy danh sách ca làm việc theo Id công ty
exports.getShiftByComId = async (req, res) => {

    const companyID = req.body.companyID;
    console.log(companyID)
    if (!companyID) {
        functions.setError(res, "Company id required");
    } else if ( isNaN(companyID)) {
        functions.setError(res, "Company id must be a number");
    } else {
        await functions.getDatafind(Shifts, { companyID: companyID })
            .then((shifts) => functions.success(res, "Get shift's data successfully", shifts))
            .catch(err => functions.setError(res, err.message, 623));
    }


};

exports.createShift = async (req, res) => {

    const companyID = req.body.companyID;;
    const shiftName = req.body.shiftName;
    const timeCheckIn = req.body.timeCheckIn;
    const timeCheckOut = req.body.timeCheckOut;
    const timeCheckInEarliest = req.body.timeCheckInEarliest;
    const timeCheckOutLastest = req.body.timeCheckOutLastest;
    let idTypeCalculateWork = req.body.idTypeCalculateWork;
    let numOfWorkPerShift = req.body.numOfWorkPerShift;
    let typeCalculateWork = "";
    let money = req.body.money;
    
    // console.log(idTypeCalculateWork)
    
    
    if (!companyID) {
        functions.setError(res, "Company id required");
    // } else if (typeof companyID !== "number") {
    //     functions.setError(res, "Company id must be a number");
    } else if (!shiftName) {
        functions.setError(res, "Shifts name required");
    } else if (!timeCheckIn) {
        functions.setError(res, "Time check in required");
    } else if (!timeCheckOut) {
        functions.setError(res, "Time check out required");
    }
    else if (!timeCheckInEarliest) {
        functions.setError(res, "Time check in earliest required");
    } else if (!timeCheckOutLastest) {
        functions.setError(res, "Time check out lastest required");
    }
    else if (!idTypeCalculateWork) {
        functions.setError(res, "Id type calculation work required");
    } else {
        
        if (idTypeCalculateWork === 2) {
            console.log(idTypeCalculateWork)
            if (!numOfWorkPerShift) {
                await functions.setError(res, "Number of work per shift required");
            } else {
                return  money = null,
                        typeCalculateWork = "Tính công theo số ca";
            }
        } else if (idTypeCalculateWork === 3) {
            if (!money) {
                await functions.setError(res, "Money of shift required");
            } else {
                return  numOfWorkPerShift = null,
                        typeCalculateWork = "Tính công theo tiền";
            }
        } else if (idTypeCalculateWork === 1) {
            return  numOfWorkPerShift = null,
                    money = null,
                    typeCalculateWork = "Tính công theo giờ";
            
        }
        // } else {
        //     return functions.setError(res, "");
        // }
        let maxId = await functions.getMaxID(Shifts);
        const   timeIn = timeCheckIn != 0 ? new Date(timeCheckIn * 1000) : null,
                timeOut = timeCheckOut != 0 ? new Date(timeCheckOut * 1000) : null,
                tEarliest = timeCheckInEarliest != 0 ? new Date(timeCheckInEarliest * 1000) : null,
                tLastest = timeCheckOutLastest != 0 ? new Date(timeCheckOutLastest * 1000) : null
        if (!maxId) {
            maxId = 0;
        }
        
        const _id = Number(maxId) + 1;
        const shift = new Shifts({
            _id: _id,
            companyID: companyID,
            shiftName: shiftName,
            timeCheckIn: timeIn,
            timeCheckOut: timeOut,
            timeCheckInEarliest: tEarliest,
            timeCheckOutLastest: tLastest,
            idTypeCalculateWork: idTypeCalculateWork,
            typeCalculateWork: typeCalculateWork,
            numOfWorkPerShift: numOfWorkPerShift,
            money: money,
        
        });
        
        await shift.save()
        .then(() => {
            functions.success(res, "Shifts saved successfully", shift);
        })
        .catch(err => {
            functions.setError(res, err.message);
        })
       
    }
    
    
    

};

exports.editShift = async (req, res) => {
    const _id = req.body.id;
    console.log(_id)
    if (isNaN(_id)) {
        functions.setError(res, "Id must be a number");
    } else {
        const companyID = req.body.companyID;;
        const shiftName = req.body.shiftName;
        const timeCheckIn = req.body.timeCheckIn;
        const timeCheckOut = req.body.timeCheckOut;
        const timeCheckInEarliest = req.body.timeCheckInEarliest;
        const timeCheckOutLastest = req.body.timeCheckOutLastest;
        const idTypeCalculateWork = req.body.idTypeCalculateWork;
        const numOfWorkPerShift = req.body.numOfWorkPerShift;
        const money = req.body.money;

        if (!companyID) {
            console.log(companyID)
            functions.setError(res, "Company id required");
        } else if (isNaN(companyID)) {
            functions.setError(res, "Company id must be a number");
        } else if (!shiftName) {
            functions.setError(res, "Shifts name required");
        } else if (!timeCheckIn) {
            functions.setError(res, "Time check in required");
        } else if (!timeCheckOut) {
            functions.setError(res, "Time check out required");
        }
        else if (!timeCheckInEarliest) {
            functions.setError(res, "Time check in earliest required");
        } else if (!timeCheckOutLastest) {
            functions.setError(res, "Time check out lastest required");
        } 
        else if (!idTypeCalculateWork) {
            functions.setError(res, "Id type calculation work required");
        } else {
            let typeCalculateWork = ""
            if (idTypeCalculateWork === 2) {
                if (!numOfWorkPerShift) {
                    functions.setError(res, "Number of work per shift required");
                    return
                } else {
                    money = null;
                    typeCalculateWork = "Tính công theo số ca";
                }
            } else if (idTypeCalculateWork === 3) {
                if (!money) {
                    functions.setError(res, "Money of shift required");
                    return
                } else {
                    numOfWorkPerShift = null;
                    typeCalculateWork = "Tính công theo tiền";
                }
            }

            if (idTypeCalculateWork === 1) {
                typeCalculateWork = "Tính công theo giờ";
            }

            const shift = await functions.getDatafindOne(Shifts, { _id: _id });
            if (!shift) {
                functions.setError(res, "Shifts does not exist!");
            } else {
                await functions.getDatafindOneAndUpdate(Shifts,{ _id: _id }, {
                    companyID: companyID,
                    shiftName: shiftName,
                    timeCheckIn: timeCheckIn,
                    timeCheckOut: timeCheckOut,
                    timeCheckInEarliest: timeCheckInEarliest,
                    timeCheckOutLastest: timeCheckOutLastest,
                    idTypeCalculateWork: idTypeCalculateWork,
                    typeCalculateWork: typeCalculateWork,
                    numOfWorkPerShift: numOfWorkPerShift,
                    money: money
                })
                    .then((shift) => functions.success(res, "Shifts edited successfully", shift))
                    .catch((err) => functions.setError(res, err.message));
            }
        }
    }
}

exports.deleteShift = async (req, res) => {
    const _id = req.params.id;
    console.log(_id)
    if (!functions.checkNumber(_id)) {
        functions.setError(res, "Id must be a number", 621);
    } else {
        const shift = await functions.getDatafindOne(Shifts, { _id: _id });
        console.log(shift)
        if (!shift) {
            functions.setError(res, "Shifts does not exist");
        } else {
            functions.getDataDeleteOne(Shifts, { _id: _id })
                .then(() => functions.success(res, "Delete shift successfully", shift))
                .catch((err) => functions.setError(res, err.message));
        }
    }
}

exports.deleteShiftCompany = async (req, res) => {
    const { companyID } = req.body;

    if (!companyID) {
        functions.setError(res, "Company id required");
    } else if (isNaN(companyID)) {
        functions.setError(res, "Company id must be a number");
    } else {
        const shifts = await functions.getDatafind(Shifts, { companyID: companyID });
        if (!shifts) {
            functions.setError(res, "No shifts found in this company");
        } else {
            await Shifts.deleteMany({ companyID: companyID })
                .then(() => functions.success(res, "Shifts deleted successfully", shifts))
                .catch((err) => functions.setError(res, err.message));
        }
    }



}

exports.deleteAllShifts = async (req, res) => {
    if (!await functions.getMaxID(Shifts)) {
        functions.setError(res, "No shift existed");
    } else {
        Shifts.deleteMany()
            .then(() => functions.success(res, "Delete all shifts sucessfully"))
            .catch(err => functions.setError(err, err.message));
    }
}