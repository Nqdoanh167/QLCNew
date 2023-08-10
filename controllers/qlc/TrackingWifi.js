const functions = require("../../services/functions");
// const users = require("../../models/Users")
// const calEmp = require("../../models/qlc/CalendarWorkEmployee")
const Tracking = require("../../models/qlc/TrackingWifi")
// đổ danh sách wifi chấm công 
exports.getlist = async (req, res) => {
    try {
        const companyID = req.body.companyID;
        // console.log(companyID)
        if (!companyID) {
            functions.setError(res, "company Id required")
        }else if (isNaN(companyID) ) {
            functions.setError(res, "company Id must be a number")
        }else{
            const data = await Tracking.find( { companyID: companyID  }).select("nameWifi MacAddress CreateAt isDefaul");
            if (data) {
                return await functions.success(res, 'Lấy lich thành công', {data});
            };
            return functions.setError(res, 'Không có dữ liệu', 404);
        }
       
    } catch (err) {
        functions.setError(res, err.message);
    };

}
//tạo để test
exports.CreateQR = async (req,res)=>{
    

    const { companyID,nameWifi,IPaddress,MacAddress,CreateAt,isDefaul,status } = req.body;


    if ((  companyID  && nameWifi && IPaddress && MacAddress && isDefaul && status)== undefined) {
        functions.setError(res, "some field required");
    }else if (isNaN(companyID)) {
        functions.setError(res, "Company id must be a number");
    }else {
        let maxId = await functions.getMaxID(Tracking);
        if (!maxId) {
            maxId = 0;
        }
        const _id =Number(maxId) + 1;
        const tracking = new Tracking({
            _id : _id,
            companyID: companyID,
            status: status,
            nameWifi: nameWifi,
            CreateAt: new Date(),
            isDefaul: isDefaul,
            IPaddress: IPaddress,
            MacAddress: MacAddress,
        


        });
        await tracking.save()
            .then(()=>{
                functions.success(res,"Tracking statusful",tracking)
            })
            .catch(err =>{
                functions.setError(res,err.message)
            })
    }
};