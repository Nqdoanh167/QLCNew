const Device = require("../../models/qlc/CheckDevice")
const functions= require ("../../services/functions")

//lấy danh sách thiết bị 
exports.getAllDevice = async (req,res)=>{
    await functions.getDatafind(Device,{})
    .then((devices)=> functions.success(res,"Get data successful",devices))
    .catch((e)=>functions.setError(res,err.message));

};
//loc danh sach theo cty 
exports.getALlCompanyDevice = async (req,res)=>{
    const {companyId} =req.body
    
    if (!companyId) {
        functions.setError(res, "company Id required")
    }else if (isNaN(companyId)) {
        functions.setError(res, "company Id must be a number")
    }else {
        const companyDevice = await functions.getDatafind(Device,{companyId : companyId});
        if(!companyDevice){
            functions.setError(res,"company device cannot be found or does not existed")
        }else {
            functions.success(res,  " company Device found",companyDevice)
        }
    }
};
//loc danh sach theo cty va phong ban
exports.getALlCompanyDevice = async (req,res)=>{
    const {companyId, depID} =req.body
    if (!companyId) {
        functions.setError(res, "company Id required")
    }else if (isNaN(companyId) ) {
        functions.setError(res, "company Id must be a number")
    }else if (!depID) {
        functions.setError(res,"department Id required")
    }else if (isNaN(depID) ) {
        functions.setError(res, "department Id must be a number")

    }else {
        const companyDevice = await functions.getDatafind(Device,{companyId : companyId},{depID : depID});
        if(!companyDevice){
            functions.setError(res,"company device cannot be found or does not existed")
        }else {
            functions.success(res,  " company Device found",companyDevice)
        }
    }
};
// ////loc danh sach theo cty va phong ban 
// exports.getAllDepDevice = async (req,res)=>{
//     const {companyId, depID} =req.body;

//     if (!companyId) {
//         functions.setError(res, "company Id required")
//     }else if (isNaN(companyId)) {
//         functions.setError(res, "company Id must be a number")
//     }else if (!depID) {
//         functions.setError(res,"department Id required")
//     }else if (isNaN(depID)) {
//         functions.setError(res, "department Id must be a number")
//     // }else if (!_id) {
//     //     functions.setError(res," _Id required")
//     // }else if (isNaN(_id)) {
//     //     functions.setError(res, "_Id must be a number")

//     }else {
//         const companyDevice = await functions.getDatafindOne(Device,{companyId : companyId},{depID : depID});
//         if(!companyDevice){
//             functions.setError(res,"company device cannot be found or does not existed")
//         }else {
//             functions.success(res,  " company Device found",companyDevice)
//         }
//     }
// };
//lấy thiết bị theo Id 
exports.getDeviceById = async (req,res)=>{
    const _id = req.params.id
    
    if (isNaN(_id)) {
        functions.setError(res,"id must be  a number")
    } else {
        const device = await functions.getDatafindOne(Device,{_id : _id})
        if(!device){
            functions.setError(res,"devive not found or doesnt existed")
        }else{
            functions.success(res,"device found",device)
        }
    }

}
//tao moi yeu cau
exports.createDevice = async (req,res)=>{
    const {userId , companyId, depID , curDeviceName , newDeviceName} =req.body 
    //check loi 
    if(!userId) {
        functions.setError(res,"userId required")
    }else if (isNaN(userId)){
        functions.setError(res,"userId must be a number ")
    }else if (!companyId) {
        functions.setError(res,"companyId required")
    }else if (isNaN(companyId)){
        functions.setError(res,"companyId required")
    }else if (!depID) {
        functions.setError(res,"companyId required")
    }else if (isNaN(depID)){
        functions.setError(res,"companyId required")
    }else if (!curDeviceName) {
        functions.setError(res,"companyId required")
    }else if (!newDeviceName) {
        functions.setError(res,"companyId required")
    }else {
        let maxID = await functions.getMaxID(Device)
        if(!maxID) {
            maxID = 0
        }
        const _id = Number(maxID) + 1;

        const device = new Device({
            _id: _id,
            userId:userId,
            companyId: companyId,
            depID: depID,
            curDeviceName: curDeviceName,
            newDeviceName: newDeviceName,
        })

        await device.save()
        .then(()=>{
            functions.success(res,"create check device successful",{device})
        })
        .catch(err => functions.setError(res,err.message));

    }
}
//chinh sua yeu cau 
exports.editDevice = async (req,res)=>{
    const _id = req.params.id;

    if(isNaN(_id)){
        functions.setError(res, "id must be a number")
    } else {
        const {userId , depID , curDeviceName , newDeviceName} = req.body;
        if(!userId) {
            functions.setError(res,"userId required")
        }else if (isNaN(userId)){
            functions.setError(res,"userId must be a number ")
        }else if (!depID) {
            functions.setError(res,"companyId required")
        }else if (isNaN(depID)){
            functions.setError(res,"companyId required")
        }else if (!curDeviceName) {
            functions.setError(res,"companyId required")
        }else if (!newDeviceName) {
            functions.setError(res,"companyId required")
        }else {
            const device = await functions.getDatafindOne(Device,{_id : _id})
            if(!device){
                functions.setError(res,"check device doesnt existed")
            }else{
            
                await functions.getDatafindOneAndUpdate(Device,{_id : _id},{
                    userId: userId,
                    depID: depID,
                    curDeviceName: curDeviceName,
                    newDeviceName: newDeviceName
                })
                .then((device)=> functions.success(res,"check device edited successful", device ))
                .catch((err)=> functions.setError(res,err.message));
            }
        }
    }
}
//xoa yeu cau cau dang ki thiet bi
exports.deleteDevice = async (req,res)=>{
    const _id = req.params.id;

    if(isNaN(_id)){
        functions.setError(res,"id must be a number");
    }else {
        const devices = await functions.getDatafindOne(Device,{_id :_id})
        if(!devices) {
            functions.setError(res, "check device doesnt exist")
        }else {
            await functions.getDataDeleteOne(Device, {_id :_id})
            .then(()=> functions.success(res,"delete check device successful",devices))
            .catch((err)=>functions.setError(res,err.message))
        }
    }
}
//xoa yeu cau cau dang ki thiet bi
exports.deleteAllDevice = async (req,res)=>{
    if(!await functions.getMaxID(Device)){
        functions.setError(res,"no check device existed")
    }else {
        Device.deleteMany()
        .then(()=>functions.success(res, "delete all check device successful"))
        .catch((err)=> functions.setError(res, err.message))
    }
}