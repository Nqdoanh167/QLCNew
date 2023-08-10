const functions = require("../../services/functions");
// const users = require("../../models/Users")
// const calEmp = require("../../models/qlc/CalendarWorkEmployee")
const Tracking = require("../../models/qlc/TrackingQR")
//lấy danh sách vị trí công ty chấm công bằng QR


//tạo Api
exports.CreateQR = async (req,res)=>{
    

    const { companyID,QRlogo,latitude,longtitude,Location,CreateAt,radius,isDefaul,status,QRstatus } = req.body;


    if ((  companyID  && QRlogo  && latitude && longtitude && Location && radius && isDefaul && status)== undefined) {
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
            QRstatus: QRstatus,
            status: status,
            QRlogo: QRlogo,
            CreateAt: new Date(),
            isDefaul: isDefaul,
            latitude: latitude ,
            longtitude: longtitude,
            Location: Location,
            radius: radius,
        


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


exports.getlist = async (req, res) => {
    try {
        const companyID = req.body.companyID;
        // console.log(companyID)
        if (!companyID) {
            functions.setError(res, "company Id required")
        }else if (isNaN(companyID) ) {
            functions.setError(res, "company Id must be a number")
        }else{
            const data = await Tracking.find( { companyID: companyID  }).select("Location latitude longtitude QRlogo");
            if (data) {
                return await functions.success(res, 'Lấy lich thành công', {data});
            };
            return functions.setError(res, 'Không có dữ liệu', 404);
        }
       
    } catch (err) {
        functions.setError(res, err.message);
    };

}
