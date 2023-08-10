// const AdminUser = require('../../../models/AdminUser');
const VanBan = require('../../../models/Vanthu365/van_ban');
const functions = require("../../../services/functions");
// const vanThuService = require("../../../services/vanthu");
// const ThayThe = require("../../../models/Vanthu365/tbl_thay_the");
// const ThongBao = require("../../../models/Vanthu365/tl_thong_bao");
// const UserVT = require("../../../models/Vanthu365/user_model");

exports.getTotalVanBan = async(req, res, next) => {
  try{
    let data = "ddd";
    return functions.success(res, data);
  }catch(err){
    console.log("Err from server!", err);
    return functions.setError(res, err, 500);
  }
}