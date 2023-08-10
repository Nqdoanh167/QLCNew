const functions = require('../../../services/functions')
const tbl_qly_congvan = require('../../../models/Vanthu365/tbl_qly_congvan')
exports.index =  async (req,res,next) =>{
    try {
        let data = {};
        let comId = req.comId || 3312;
        let epId =  req.epId  || 1000;
        let dem_tong = await tbl_qly_congvan.countDocuments({cv_usc_id:comId,cv_type_xoa:0,cv_type_hd:0},{cv_id:1});
        let dem_den = await tbl_qly_congvan.countDocuments({cv_usc_id:comId,cv_type_xoa:0,cv_type_hd:0,cv_type_loai:1},{cv_id:1});
        let dem_di = await tbl_qly_congvan.countDocuments({cv_usc_id:comId,cv_type_xoa:0,cv_type_hd:0,cv_type_loai:2},{cv_id:1});
        let hd_tong = await tbl_qly_congvan.countDocuments({cv_usc_id:comId,cv_type_xoa:0,cv_type_hd:1},{cv_id:1});
        let hd_den = await tbl_qly_congvan.countDocuments({cv_usc_id:comId,cv_type_xoa:0,cv_type_hd:1,cv_type_loai:1},{cv_id:1});
        let hd_di = await tbl_qly_congvan.countDocuments({cv_usc_id:comId,cv_type_xoa:0,cv_type_hd:1,cv_type_loai:2},{cv_id:1});
        let arr_xoa = await tbl_qly_congvan.find({cv_usc_id:comId,cv_type_xoa:0},{cv_id:1,cv_name:1,cv_so:1,cv_type_loai:1,cv_type_hd:1,cv_time_created:1}).sort({cv_time_created:-1}).limit(6);
        data.dem_tong = dem_tong;
        data.dem_den = dem_den;
        data.dem_di = dem_di;
        data.hd_tong = hd_tong;
        data.hd_den = hd_den;
        data.hd_di = hd_di;
        data.arr_xoa = arr_xoa;
        return functions.success(res,'get data success',{data})
    } catch (error) {
        return functions.setError(res,error)
    }
}