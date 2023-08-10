
const De_Xuat = require('../../../models/Vanthu/de_xuat');
const cate_de_xuat = require('../../../models/Vanthu/cate_de_xuat');
const setting_dx = require('../../../models/Vanthu/setting_dx');
const User = require('../../../models/Users');


// trang tôi gửi đi 
exports.deXuat_user_send = async (req, res) => {
  try {
    let { type, time_s, time_e, id_user_duyet,page } = req.body;
    const id_user = req.user.idQLC
    const com_id = req.user.data.inForPerson.employee.com_id;
    const perPage = 10; // Giá trị mặc định nếu không được cung cấp
    const startIndex = (page - 1) * perPage;
    const sortOptions = { _id: -1 };
    if (typeof id_user === 'undefined') {
      return res.status(400).json({ error: 'id_user không được bỏ trống.' });
    }

    if (!com_id) {
      return res.status(400).json({ error: 'com_id không được bỏ trống.' });
    }

    if (!type) {
      return res.status(400).json({ error: 'type không được bỏ trống.' });
    }

    let query = {
      id_user: id_user,
      com_id: com_id,
      del_type: 1
    };
    if (id_user_duyet) {
      query.id_user_duyet =  { $in: [id_user_duyet] };
    }
    if (time_s && time_e) {
      query.time_create = { $gte: new Date(time_s), $lte: new Date(time_e) };
    } else if (time_s) {
      query.time_create = { $gte: new Date(time_s) };
    } else if (time_e) {
      query.time_create = { $lte: new Date(time_e) };
    }

    if (type == 1) { // Hiển thị tất cả
      const showAll = await De_Xuat.find(query);
      return res.status(200).json(showAll)
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);
    }

    if (type == 2) { // Hiển thị đang chờ duyệt
      query.active = 1;
      query.type_duyet = { $in: [0, 7] };
      const showCD = await De_Xuat.find(query);
      return res.status(200).json(showCD)
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);
    }

    if (type == 4) { // Hiển thị đã phê duyệt
      query.active = 0;
      query.type_duyet = 5;
      const showD = await De_Xuat.find(query);
      return res.status(200).json(showD)
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);
    }

    if (type == 5) { // Hiển thị đã từ chối
      query.$or = [{ active: 2 }, { type_duyet: 3 }];
      const showTC = await De_Xuat.find(query);
      return res.status(200).json(showTC)
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);;
    }
    else{
      return res.status(200).json({error : "type khong hop le"})
    }
  } catch (error) {
    console.error('Failed to show', error);
    res.status(500).json({ error: 'Failed to show' });
  }
};

//trang gửi đến tôi 
exports.de_xuat_send_to_me = async (req, res) => {
  try {
    let { type,id_user, name_dx, type_dx, time_s, time_e,page } = req.body;
    const id_user_duyet = req.user.idQLC
    const com_id = req.user.data.inForPerson.employee.com_id;
    const perPage = 10; // Giá trị mặc định nếu không được cung cấp
    const startIndex = (page - 1) * perPage;
    const sortOptions = { _id: -1 };
    if (!id_user_duyet) {
      return res.status(400).json({ error: 'id_user_duyet không được bỏ trống.' });
    }

    if (!com_id) {
      return res.status(400).json({ error: 'com_id không được bỏ trống.' });
    }

    if (!type) {
      return res.status(400).json({ error: 'type không được bỏ trống.' });
    }
    let query = {
      id_user_duyet:  { $in: [id_user_duyet] },
      com_id: com_id,
      del_type: 1
    };
    if (type_dx) {
      query.type_dx = type_dx;
    }
    if (name_dx) {
      query.name_dx = { $regex: name_dx, $options: "i" };
    }
    if (id_user) {
      query.id_user = id_user;
    }
    if (time_s && time_e) {
      query.time_create = { $gte: new Date(time_s), $lte: new Date(time_e) };
    } else if (time_s) {
      query.time_create = { $gte: new Date(time_s) };
    } else if (time_e) {
      query.time_create = { $lte: new Date(time_e) };
    }
    if (type == 1) { // Hiển thị tất cả
      const showAll = await De_Xuat.find(query)
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);;
      return res.status(200).json(showAll);
    }
    if (type == 2) { // Hiển thị đang chờ duyệt
      query.active = 1;
      query.type_duyet = { $in: [0, 7] };
      const showCD = await De_Xuat.find(query)
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);;
      return res.status(200).json(showCD);
    }
    if (type == 4) { // Hiển thị đã phê duyệt
      query.active = 0;
      query.type_duyet = 5;
      const showD = await De_Xuat.find(query)
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);;
      return res.status(200).json(showD);
    }
    if (type == 5) { // Hiển thị đã từ chối
      query.$or = [{ active: 2 }, { type_duyet: 3 }];
      const showTC = await De_Xuat.find(query).sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);
      return res.status(200).json(showTC)
       
     
    } else{
      return res.status(200).json({error : "type khong hop le"})
      }
  } catch (error) {
    console.error('Failed to show ', error);
    res.status(500).json({ error: 'Failed to show' });
  }
}

//trang người theo dõi 
exports.de_xuat_theo_doi = async (req, res) => {
  try {
    let { type,page } = req.body;
    const id_user_theo_doi = req.user.idQLC
    const com_id = req.user.data.inForPerson.employee.com_id;
    const perPage = 10; // Giá trị mặc định nếu không được cung cấp
    const startIndex = (page - 1) * perPage;
    const sortOptions = { _id: -1 };
    if (!id_user_theo_doi) {
      return res.status(400).json({ error: 'id_user_theo_doi không được bỏ trống.' });
    }
    if (!com_id) {
      return res.status(400).json({ error: 'com_id không được bỏ trống.' });
    }
    if (!type) {
      return res.status(400).json({ error: 'type không được bỏ trống.' });
    }
    if (type == 1) {
      const showAll = await De_Xuat.find({
        id_user_theo_doi: { $in: [id_user_theo_doi] },
        com_id: com_id,
        del_type: 1
      })
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);
      return res.status(200).json(showAll);
    }
    if (type == 2) {
      const showCD = await De_Xuat.find({
        id_user_theo_doi: { $in: [id_user_theo_doi] },
        com_id: com_id,
        del_type: 1,
        type_duyet: { $in: [0, 7] },
      })
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);
      return res.status(200).json(showCD)
    }
    if (type == 3) {
      const checkSetting = await setting_dx.findOne({ com_id: com_id })
      if (!checkSetting) {
        return res.status(400).json({ error: 'Công ty chưa cài đặt hạn duyệt.' });
      }
     let timeLimit = checkSetting.time_limit * 60 * 60 * 1000; // Chuyển time_limit thành mili giây
      const exceedingDeXuat = await De_Xuat.find({
        id_user_theo_doi: { $in: [id_user_theo_doi] },
        com_id: com_id,
        del_type: 1,
        $expr: { $gt: [{ $subtract: [new Date(), "$time_create"] }, timeLimit] }
      })
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);;
      return res.status(200).json(exceedingDeXuat);
    }
    if (type == 4) {
      const showD = await De_Xuat.find({
        com_id: com_id,
        id_user_theo_doi: { $in: [id_user_theo_doi] },
        del_type: 1,
        type_duyet: 5,
        active: 1
      }).sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);
      return res.status(200).json(showD);
    }
    if (type == 5) {
      const showTC = await De_Xuat.find({
        com_id: com_id,
        id_user_theo_doi: { $in: [id_user_theo_doi] },
        $or: [{ active: 2 }, { type_duyet: 3 }],
      })
        .sort(sortOptions)
        .skip(startIndex)
        .limit(perPage);
      return res.status(200).json(showTC);
    }
  } catch (error) {
    console.error('Failed to show ', error);
    res.status(500).json({ error: 'Failed to show' });
  }
}


//danh sách đề xuất
exports.admin_danh_sach_de_xuat = async (req, res) => {
  try {
    let { phong_ban,id_user, type_dx, type_duyet, time_s, time_e, page, perPage } = req.body;
    let com_id = req.user.data.inForPerson.employee.com_id;
    if (!perPage) {
      perPage = 10; // Giá trị mặc định nếu không được cung cấp
    }
    const startIndex = (page - 1) * perPage;

    // Các điều kiện kiểm tra bỏ trống và khác
   
    if (!com_id) {
      return res.status(400).json({ error: 'com_id không được bỏ trống.' });
    }

    // Tạo câu truy vấn dựa trên các điều kiện tìm kiếm
    let query = { com_id: com_id };

    if (phong_ban) {
      let checkUser = await User.find({
        'inForPerson.employee.dep_id': phong_ban
      }).select('idQLC');
      const userId = checkUser.map(item => item.idQLC);
      query.$or = [{ com_id: com_id }, { id_user: { $in: userId } }];
    }

    if (id_user) {
      query.id_user = id_user;
    }

    if (type_dx) {
      query.type_dx = type_dx;
    }

    if (type_duyet) {
      query.type_duyet = type_duyet;
    }

    const sortOptions = { _id: -1 };


    if (time_s && time_e) {
      query.time_create = { $gte: new Date(time_s), $lte: new Date(time_e) };
    }

    const showDeXuat = await De_Xuat.find(query)
      .select('name_user name_dx time_create type_duyet')
      .sort(sortOptions)
      .skip(startIndex)
      .limit(perPage);

    const totalCount = await De_Xuat.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    res.status(200).json({ data: showDeXuat, totalPages });
  } catch (error) {
    console.error('Failed to show ', error);
    res.status(500).json({ error: 'Failed to show' });
  }
};
