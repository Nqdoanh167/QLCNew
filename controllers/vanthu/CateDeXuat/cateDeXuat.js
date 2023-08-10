const CateDeXuat = require("../../../models/Vanthu/cate_de_xuat");
const { storageVT } = require('../../../services/functions');
const multer = require('multer');
const functions = require("../../../services/functions");
const DeXuat = require('../../../models/Vanthu/de_xuat')
const HideCateDX = require('../../../models/Vanthu/hide_cate_dx')
const UserDX = require("../../../models/Users")



//Api hiển thị chi tiết đề xuất 

exports.ChitietDx = async (req, res) => {
  try {
    let { _id } = req.body;
    let dexuat = await DeXuat.findOne({ _id });
    if (!dexuat) {
      res.status(404).json({ message: 'Không tìm thấy bản ghi dexuat' });
    } else {
      const checkuserduyet = dexuat.id_user_duyet.split(',').map(Number);
      // Tìm bản ghi trong bảng User dựa trên checkuserduyet
      const users = await UserDX.find({ idQLC: { $in: checkuserduyet } });
      // Tìm bản ghi trong bảng UserDX dựa trên id_nguoi_theo_doi
      const checkusertheodoi = dexuat.id_user_theo_doi.split(',').map(Number); 
      const usertd = await UserDX.find({ idQLC: { $in: checkusertheodoi }  });
      // Tiếp tục xử lý và trả về kết quả
      let namnUserDuyet = users.map(user => user.userName);
      let namnUsertd = usertd.map(user => user.userName);
      let data = { dexuat, namnUserDuyet, namnUsertd };
      res.status(200).json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể hiển thị' });
  }
};



// Api hiển thị trang home tà khoản công ty và cá nhân

exports.showHome = async (req, res) => {
  try {
    const { page } = req.body;
    const perPage = 6; // Số lượng giá trị hiển thị trên mỗi trang
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    let com_id = req.user.data.inForPerson.employee.com_id
  
    let id_user = req.user.data.idQLC
    let dxChoDuyet = '';
    let totaldx = '';
    let dxCanduyet = '';
    let dxduyet = '';
    if (req.user.data.type == 1) {
      totaldx = await DeXuat.countDocuments({ com_id, del_type: 1 }); // đếm tổng số đề xuất
      dxChoDuyet = await DeXuat.countDocuments({ com_id, del_type: 1, type_duyet: 7 }) //đếm tổng số đề xuất chờ duyệt
      dxCanduyet = await DeXuat.countDocuments({ com_id, del_type: 1, type_time: 2, type_duyet: 0 }) // đếm số đề xuất cần duyệt
      dxduyet = await DeXuat.countDocuments({ com_id,com_id, del_type: 1, type_duyet: 5 }) // đếm tổng số dề xuất đã được duyệt
      let showCT = await DeXuat.find({ com_id }).sort({ _id: -1 }).skip(startIndex).limit(perPage);
      res.status(200).json({ totaldx, dxChoDuyet, dxCanduyet, dxduyet, data: showCT }); // hiển thị trang home công ty
    } else if (req.user.data.type == 2) {
      totaldx = await DeXuat.countDocuments({ id_user, del_type: 1 }); // đếm tổng số đề xuất
      dxChoDuyet = await DeXuat.countDocuments({id_user : id_user, del_type: 1, type_duyet: 7 }) //đếm tổng số đề xuất chờ duyệt
      dxCanduyet = await DeXuat.countDocuments({id_user : id_user, del_type: 1, type_time: 2, type_duyet: 0 }) // đếm số đề xuất cần duyệt
      dxduyet = await DeXuat.countDocuments({ id_user : id_user, del_type: 1, type_duyet: 5 })// đếm tổng số dề xuất đã được duyệt
      let showNV = await DeXuat.find({ id_user, del_type: 1 }).sort({ _id: -1 }).skip(startIndex).limit(perPage);
      res.status(200).json({ totaldx, dxChoDuyet, dxCanduyet, dxduyet, data: showNV });// hiển thị trang home nhân viên
    }else{
      res.status(400).json({ error: 'Bạn ko có quyền' });
    }
  } catch (error) {
    console.error('Failed to get DX', error);
    res.status(500).json({ error: 'Failed to get DX' });
  }
};


// Hiển thị trang show nghỉ  tìm kiếm
exports.showNghi = async (req, res) => {
  try {
    const { page, time_s, time_e, dep_id, emp_id, type_duyet } = req.body;
    const com_id = req.user.data.inForPerson.employee.com_id;
    const perPage = 10;
    const skip = (page - 1) * perPage;

    const query = {
      del_type: 1,
      type_dx: { $in: [1, 18] },
      ...(time_s && time_e && { time_create: { $gte: time_s, $lte: time_e } })
    };

    if (time_s > time_e) {
      return res
        .status(400)
        .json({ error: "Thời gian bắt đầu không thể lớn hơn thời gian kết thúc." });
    }
    if (type_duyet) {
      query.type_duyet = type_duyet;
    }

    // Tìm các đề xuất liên quan dựa trên trường dep_id và emp_id từ bảng User
    const userQuery = {
      'inForPerson.employee.com_id': com_id,
      ...(dep_id && { 'inForPerson.employee.dep_id': dep_id }),
      ...(emp_id && { 'inForPerson.employee.emp_id': emp_id })
    };

    const users = await UserDX.find(userQuery);

    // Lấy danh sách các com_id từ các người dùng tìm được
    const comIds = users.map(user => user.inForPerson.employee.com_id);

    // Thêm trường com_id và type_dx vào query để tìm kiếm đề xuất
    query.com_id = { $in: comIds };

    const shownghi = await DeXuat.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    res.status(200).json(shownghi);
  } catch (error) {
    console.error('Failed to shownghi', error);
    res.status(500).json({ error: 'Failed to shownghi' });
  }
};








//Api thay đổi trạng thái thái ẩn hiện đề xuất
exports.changeCate = async (req, res) => {
  try {
    const {  id, value } = req.body;
     let com_id =  req.user.data.inForPerson.employee.com_id;
    // Kiểm tra xem loại đề xuất đã được ẩn hay chưa
    const hideCate = await HideCateDX.findOne({ id_com: com_id });
    let hideCateStr = hideCate.id_cate_dx.toString();

    if (value == 1) {
      // Xóa ẩn loại đề xuất
      const idStr = id.toString();
      if (hideCateStr.includes(idStr)) {
        hideCateStr = hideCateStr.replace(',' + idStr, '');
        hideCate.id_cate_dx = hideCateStr;
        await hideCate.save();
        return res.status(200).json({ success: true, message: 'Hủy ẩn loại đề xuất thành công!' });
      } else {
        return res.status(200).json({ success: true, message: 'Loại đề xuất này chưa được ẩn!' });
      }
    } else {
      // Thêm ẩn loại đề xuất
      const idStr = id.toString();
      if (hideCateStr.includes(idStr)) {
        return res.status(200).json({ success: true, message: 'Loại đề xuất này đã được ẩn rồi!' });
      } else {
        hideCateStr += ',' + idStr;
        hideCate.id_cate_dx = hideCateStr;
        await hideCate.save();
        return res.status(200).json({ success: true, message: 'Ẩn loại đề xuất thành công!' });
      }
    }
  } catch (error) {
    console.error('Failed to changeCate', error);
    return res.status(500).json({ error: 'Failed to changeCate' });
  }
};







// tìm theo tên loại đề xuất + hiển thị các loại đề xuất

exports.findNameCate = async (req, res) => {
  try {
    let { name_cate_dx, page } = req.body;
    let com_id =  req.user.data.inForPerson.employee.com_id;
    const perPage = 10;
    page = parseInt(page) || 1;

    const regex = new RegExp(name_cate_dx, 'i');

    const count = await CateDeXuat
      .countDocuments({ name_cate_dx: regex });
    const totalPages = Math.ceil(count / perPage); // Tổng số trang

    const result = await CateDeXuat
      .find({ name_cate_dx: regex, com_id: 0 })
      .skip((page - 1) * perPage)
      .limit(perPage);
      const checkhide = await HideCateDX.findOne({ id_com : com_id }).select('id_cate_dx');
      if (checkhide) {
        const idHideCateDX = checkhide.id_cate_dx.split(',').map(Number);
        res.status(200).json({ result,idHideCateDX, currentPage: page, totalPages, });
      } else {
        res.status(200).json({ result,idHideCateDX : [], currentPage: page, totalPages, }); // Trả về mảng rỗng nếu không tìm thấy giá trị
      }
  } catch (error) {
    console.error('Failed to search', error);
    res.status(500).json({ error: 'Failed to search' });
  }
};



//Api hiển thị thành viên công ty

exports.findthanhVien = async (req, res) => {
  try {
    let { page,com_id } = req.body
    // let com_id = req.user.data.inForPerson.employee.com_id
    const perPage = 10; // Số lượng giá trị hiển thị trên mỗi trang
    const startIndex = (page - 1) * perPage;
    const checkTV = await UserDX.find({ 'inForPerson.employee.com_id': com_id })
      .select('idQlC userName inForPerson ')
      .sort({ 'inForPerson.employee.dep_id': -1 })
      .skip(startIndex).limit(perPage);
    res.status(200).json(checkTV);
  } catch (error) {
    console.error('Failed to find', error);
    res.status(500).json({ error: 'Failed to find' });
  }
}