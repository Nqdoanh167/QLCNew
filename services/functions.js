/** @format */

// check ảnh và video
const fs = require('fs');
// upload file
const multer = require('multer');

// gửi mail
const nodemailer = require('nodemailer');
// tạo biến môi trường
const dotenv = require('dotenv');
// mã hóa mật khẩu
const crypto = require('crypto');
// gọi api
const axios = require('axios');

// check video
const path = require('path');
//check ảnh
const {promisify} = require('util');
// tạo token
const jwt = require('jsonwebtoken');
const CV = require('../models/Timviec365/CV/Cv365');
const Users = require('../models/Users');

const MbSize = 1024 * 1024;

// giới hạn dung lượng video < 100MB
const MAX_VIDEO_SIZE = 100 * MbSize;
// danh sách các loại video cho phép
const allowedTypes = ['.mp4', '.mov', '.avi', '.wmv', '.flv'];
// giới hạn dung lượng ảnh < 2MB
const MAX_IMG_SIZE = 2 * MbSize;
// giới hạn dung lượng kho ảnh
exports.MAX_STORAGE = 300 * MbSize;

dotenv.config();

// check title
const removeAccent = (str) => {
   const accents = 'àáâãäåèéêëìíîïòóôõöùúûüýÿđ';
   const accentRegex = new RegExp(`[${accents}]`, 'g');
   const accentMap = {
      à: 'a',
      á: 'a',
      â: 'a',
      ã: 'a',
      ä: 'a',
      å: 'a',
      è: 'e',
      é: 'e',
      ê: 'e',
      ë: 'e',
      ì: 'i',
      í: 'i',
      î: 'i',
      ï: 'i',
      ò: 'o',
      ó: 'o',
      ô: 'o',
      õ: 'o',
      ö: 'o',
      ù: 'u',
      ú: 'u',
      û: 'u',
      ü: 'u',
      ý: 'y',
      ÿ: 'y',
      đ: 'd',
   };
   return str.replace(accentRegex, (match) => accentMap[match]);
};

// check title
exports.checkTilte = async (input, list) => {
   const formattedInput = removeAccent(input).toLowerCase();
   const foundKeyword = list.find((keyword) => {
      const formattedKeyword = removeAccent(keyword).toLowerCase();
      return formattedInput.includes(formattedKeyword);
   });

   if (foundKeyword) {
      return false;
   } else {
      return true;
   }
};

// hàm check title khi update
exports.removeSimilarKeywords = (keyword, arr) => {
   return arr.filter((file) => !file.startsWith(keyword));
};

// hàm mã otp ngẫu nhiên có 6 chữ số
exports.randomNumber = Math.floor(Math.random() * 900000) + 100000;
exports.keywordsTilte = ['hot', 'tuyển gấp', 'cần gấp', 'lương cao'];

// hàm validate phone
exports.checkPhoneNumber = async (phone) => {
   const phoneNumberRegex = /^(?:\+84|0|\+1)?([1-9][0-9]{8,9})$/;
   return phoneNumberRegex.test(phone);
};

// hàm validate email
exports.checkEmail = async (email) => {
   const gmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
   return gmailRegex.test(email);
};

// hàm validate link
exports.checkLink = async (link) => {
   const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
   return urlRegex.test(link);
};

// hàm validate thơi gian
exports.checkTime = async (time) => {
   const currentTime = new Date(); // Lấy thời gian hiện tại
   const inputTime = new Date(time); // Thời gian nhập vào
   if (inputTime < currentTime) {
      return false;
   } else {
      return true;
   }
};

// hàm check thời gian đăng tin 10p/1 lần
exports.isCurrentTimeGreaterThanInputTime = (timeInput) => {
   const inputTime = Date.parse(timeInput);

   const now = new Date().getTime();

   const diffInMinutes = (now - inputTime) / (1000 * 60);

   if (diffInMinutes >= 10) {
      return true;
   } else {
      return false;
   }
};

exports.getDatafindOne = async (model, condition) => {
   return model.findOne(condition).lean();
};

exports.getDatafind = async (model, condition) => {
   return model.find(condition).lean();
};

exports.getDatafindOneAndUpdate = async (model, condition, projection) => {
   return model.findOneAndUpdate(condition, projection);
};

// hàm khi thành công
exports.success = (res, messsage = '', data = []) => {
   return res.status(200).json({data: {result: true, message: messsage, ...data}, error: null});
};

// hàm thực thi khi thất bại
exports.setError = (res, message, code = 500) => {
   return res.status(code).json({data: null, code, error: {message}});
};

// hàm tìm id max
exports.getMaxID = async (model) => {
   const maxUser = (await model.findOne({}, {}, {sort: {_id: -1}}).lean()) || 0;
   return maxUser._id;
};

// hàm check định dạng ảnh
const isImage = async (filePath) => {
   const extname = path.extname(filePath).toLowerCase();
   return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(extname);
};

// hàm check ảnh
exports.checkImage = async (filePath) => {
   if (typeof filePath !== 'string') {
      return false;
   }

   const {size} = await promisify(fs.stat)(filePath);
   if (size > MAX_IMG_SIZE) {
      return false;
   }

   const isImg = await isImage(filePath);
   if (!isImg) {
      return false;
   }

   return true;
};

// hàm check video
exports.checkVideo = async (filePath) => {
   // kiểm tra loại file
   if (!allowedTypes.includes(path.extname(filePath.originalname).toLowerCase())) {
      return false;
   }
   // kiểm tra kích thước file
   if (filePath.size > MAX_VIDEO_SIZE) {
      return false;
   }
   return true;
};

exports.getDataDeleteOne = async (model, condition) => {
   return model.deleteOne(condition);
};

// storage để updload file
const storageMain = (destination) => {
   return multer.diskStorage({
      destination: function (req, file, cb) {
         const userId = req.user.data._id; // Lấy id người dùng từ request
         const userDestination = `${destination}/${userId}`; // Tạo đường dẫn đến thư mục của người dùng
         if (!fs.existsSync(userDestination)) {
            // Nếu thư mục chưa tồn tại thì tạo mới
            fs.mkdirSync(userDestination, {recursive: true});
         }
         cb(null, userDestination);
      },
      filename: function (req, file, cb) {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
         cb(null, file.fieldname + uniqueSuffix + '.' + file.originalname.split('.').pop());
      },
   });
};

const storageFile = (destination) => {
   return multer.diskStorage({
      destination: function (req, file, cb) {
         console.log(file);
         let userDestination = ' ';
         if (req.user) {
            const userId = req.user.data._id; // Lấy id người dùng từ request
            const d = new Date(req.user.data.createdAt),
               day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate(),
               month = d.getMonth() < 10 ? '0' + Number(d.getMonth() + 1) : d.getMonth(),
               year = d.getFullYear();
            userDestination = `${destination}/${year}/${month}/${day}`; // Tạo đường dẫn đến thư mục của người dùng

            if (!fs.existsSync(userDestination)) {
               // Nếu thư mục chưa tồn tại thì tạo mới
               fs.mkdirSync(userDestination, {recursive: true});
            }
         } else {
            userDestination = 'public/company';
         }
         cb(null, userDestination);
      },
      fileFilter: function (req, file, cb) {
         const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'video/quicktime'];
         console.log(file);
         if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            console.log('123');
         } else {
            cb(new Error('Only .jpeg, .png, .mp4, .webm and .mov format allowed!'));
         }
      },
      filename: function (req, file, cb) {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
         cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
         console.log(123);
      },
   });
};

exports.uploadVideoAndIMGNewTV = multer({storage: storageFile('public/KhoAnh')});

exports.uploadVideoAndIMGRegister = multer(
   {storage: storageFile('public/company')},
   (fileFilter = function (req, file, cb) {
      const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'video/quicktime'];
      console.log(file);
      if (allowedTypes.includes(file.mimetype)) {
         cb(null, true);
         console.log('123');
      } else {
         cb(new Error('Only .jpeg, .png, .mp4, .webm and .mov format allowed!'));
      }
   }),
);

//  hàm upload ảnh ở cập nhập avatar
exports.uploadImg = multer({storage: storageMain('public/KhoAnh')});

//  hàm upload ảnh ở kho ảnh
exports.uploadImgKhoAnh = multer({storage: storageMain('public/KhoAnh')});

//  hàm upload video ở kho ảnh
exports.uploadVideoKhoAnh = multer({storage: storageMain('public/KhoAnh')});

// hàm upload video ở cập nhập KhoAnh
exports.uploadVideo = multer({storage: storageMain('public/KhoAnh')});

//hàm upload file ứng viên
exports.uploadFileUv = multer({storage: storageFile('../storage/base365/timviec365/pictures/cv')});

// Upload ảnh đại diện
exports.uploadAvatar = multer({storage: storageFile('../storage/base365/timviec365/pictures/uv')});

const deleteFile = (filePath) => {
   fs.unlink(filePath, (err) => {
      if (err) throw err;
      console.log('File was deleted');
   });
};

// hàm xóa file
exports.deleteImg = async (condition) => {
   if (typeof condition == 'string') {
      return await deleteFile(condition);
   }

   if (typeof condition == 'object') {
      return await deleteFile(condition.path);
   }
};

// storega check file
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'public/cvUpload');
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
         null,
         file.fieldname +
            uniqueSuffix +
            `.$ { file.originalname.split('.').slice(-1)[0]
}
`,
      );
   },
});

// hàm check file
exports.uploadFile = multer({storage: storageFile});

exports.createError = async (code, message) => {
   const err = new Error();
   err.code = code;
   err.message = message;
   return {data: null, error: err};
};

// hàm cấu hình mail
const transport = nodemailer.createTransport({
   host: process.env.NODE_MAILER_HOST,
   port: Number(process.env.NODE_MAILER_PORT),
   service: process.env.NODE_MAILER_SERVICE,
   secure: true,
   auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
   },
});

// hàm gửi mail
exports.sendEmailVerificationRequest = async (otp, email, nameCompany) => {
   let options = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'Tìm việc 365 WEB xác thực email',
      html: `
        <body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;"><table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000"><tr style="height: 165px;background-image: url(https://timviec365.vn/images/email/bg1.png);background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
        <td style="padding-top: 23px;float: left;">
        <img src="https://timviec365.vn/images/email/logo2.png"></td>
        <td style="text-align: left;float: right;">
        <ul style="margin-top: 15px;padding-left: 0px;">
        <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">
        Hiển thị danh sách ứng viên online</span></li>
        <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Nhắn tin trực tiếp ứng viên qua Chat365</span></li><li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Cam kết bảo hành 100%</span></li></ul></td></tr><tr style="float: left;padding:10px 30px 30px 30px;"><td colspan="2"><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px;">Xin chào <span style="color:#307df1;">${nameCompany}</span></p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Chúc mừng bạn đã hoàn thành thông tin đăng ký tài khoản nhà tuyển dụng tại website Timviec365</p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Dưới đây là thông tin tài khoản đã tạo:</p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-left: 35px;">- Tài khoản: ${email}</p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-left: 35px;">- Mật khẩu: ****** </p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Dưới đây là mã OTP của bạn</p><p style="margin: auto;margin-top: 45px;text-align: center;width: 160px;height: 43px;background:#307df1;border-radius: 5px;font-size: 22px;color: #fff">${otp}</a></p></td></tr><tr style="height: 160px;background-image: url(https://timviec365.vn/images/email/bg2.png);background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;"><td style="padding-top: 50px;"><ul><li style="list-style-type: none;color: #fff;margin-bottom: 5px;"><span style="font-size: 18px;line-height: 18px;">Liên hệ với chúng tôi để được hỗ trợ nhiều hơn:</span></li><li style="list-style-type: none;color: #fff;margin-bottom: 5px;"><span style="font-size: 18px;line-height: 18px;">Hotline: <span style="color: #ffa111;">1900633682</span> - ấn phím 1</span></li><li style="list-style-type: none;color: #fff;margin-bottom: 5px;"><span style="font-size: 18px;line-height: 18px;color: #ffa111;">Trân trọng !</span></li></ul></td></tr></table></body>
        `,
   };
   transport.sendMail(options, (err, info) => {
      if (err) {
         console.log(err);
      } else {
         console.log('Message sent: ' + info.response);
      }
   });
};

exports.verifyPassword = async (inputPassword, hashedPassword) => {
   const md5Hash = crypto.createHash('md5').update(inputPassword).digest('hex');
   return md5Hash === hashedPassword;
};

// hàm check token
exports.checkToken = (req, res, next) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];
   // console.log('got token');
   if (!token) {
      return res.status(401).json({message: 'Missing token'});
   }
   jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
      // console.log('got user', user);
      if (err) {
         return res.status(403).json({message: 'Invalid token'});
      }
      req.user = user;
      next();
   });
};

// ham check admin rao nhanh 365
exports.isAdminRN365 = async (req, res, next) => {
   let user = req.user.data;
   let admin = await functions.getDatafindOne(AdminUserRaoNhanh365, {_id: user._id, isAdmin: 1, active: 1});
   if (admin) return next();
   return res.status(403).json({message: 'is not admin RN365'});
};

const checkTokenV3 = (req, res, next) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];
   if (!token) {
      return res.status(401).json({message: 'Missing token'});
   }
   jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
      if (err) {
         return res.status(403).json({message: 'Invalid token'});
      }
      req.user = user;
      next();
   });
};

// hàm tạo token
exports.createToken = async (data, time) => {
   return jwt.sign({data}, process.env.NODE_SERCET, {expiresIn: time});
};

// hàm lấy data từ axios
exports.getDataAxios = async (url, condition) => {
   return await axios({
      method: 'post',
      url: url,
      data: condition,
      headers: {'Content-Type': 'multipart/form-data'},
   }).then(async (response) => {
      return response.data;
   });
};

// hàm lấy dữ liệu ngành nghề
exports.getDataCareer = async () => {
   return [
      'An toàn lao động',
      'Báo chí - Truyền hình',
      'Bảo hiểm',
      'Bảo trì',
      'Bảo vệ',
      'Biên - Phiên dịch',
      'Bưu chính viễn thông',
      'Chăm sóc khách hàng',
      'Chăn nuôi - Thú y',
      'Cơ khí - Chế tạo',
      'Công chức - Viên chức',
      'Công nghệ cao',
      'Công nghệ thực phẩm',
      'copywrite',
      'Dầu khí - Địa chất',
      'Dệt may - Da dày',
      'Dịch vụ',
      'Du lịch',
      'Freelancer',
      'Giáo dục - Đào tạo',
      'Giao thông vận tải -Thủy lợi - Cầu đường',
      'Giúp việc',
      'Hàng hải',
      'Hàng không',
      'Hành chính - Văn phòng',
      'Hóa học - Sinh học',
      'Hoạch định - Dự án',
      'In ấn - Xuất bản',
      'IT phần cứng - mạng',
      'IT phần mềm',
      'KD bất động sản',
      'Kế toán - Kiểm toán',
      'Khánh sạn - Nhà hàng',
      'Khu chế xuất - Khu công nghiệp',
      'Kiến trúc - Tk nội thất',
      'Kỹ thuật',
      'Kỹ thuật ứng dụng',
      'Làm đẹp - Thể lực - Spa',
      'Lao động phổ thông',
      'Lễ tan - PG - PB',
      'Logistic',
      'Luật - Pháp lý',
      'Lương cao',
      'Marketing - PR',
      'Môi trường - Xử lý chất thải',
      'Mỹ phẩm - Thời trang - Trang sức',
      'Ngân hàng - chứng khoán - Đầu tư',
      'Nghệ thuật - Điện ảnh',
      'Nhân sự',
      'Kinh doanh',
      'Nhập liệu',
      'Nông - Lâm - Ngư - Nghiệp',
      'Ô tô - Xe máy',
      'Pha chế - Bar',
      'Phát triển thị trường',
      'Phục vụ - Tạp vụ',
      'Quan hệ đối ngoại',
      'Quản lý điều hành',
      'Quản lý đơn hàng',
      'Quản trị kinh doanh',
      'Sản xuất - Vận hành sản xuất',
      'Sinh viên làm thêm',
      'StarUp',
      'Tài chính',
      'Telesales',
      'Thẩm định - Giảm thẩm định - Quản lý chất lượng',
      'Thể dục - Thể thao',
      'Thiết kế - Mỹ thuật',
      'Thiết kế web',
      'Thống kê',
      'Thư ký - Trợ lý',
      'Thu Ngân',
      'Thư viện',
      'Thực phẩm - Đồ uống',
      'Thương Mại điện tử',
      'Thủy Sản',
      'Thị trường - Quảng cáo',
      'Tìm việc làm thêm',
      'Tổ chức sự kiện',
      'Trắc địa',
      'Truyển thông',
      'Tư vấn',
      'Vận chuyển giao nhận',
      'Vận tải - Lái xe',
      'Vật tư - Thiết bị',
      'Việc làm bán hàng',
      'Việc làm Tết',
      'Xây dựng',
      'Xuất - nhập khẩu',
      'Xuất khẩu lao động',
      'Y tế - Dược',
      'Đầu bếp - phụ bếp',
      'Điện - Điện tử',
      'Điện tử viễn thông',
      'ngàng nghề khác',
   ];
};

// hàm lấy dữ liệu hình thức làm việc
exports.getDataWorkingForm = async () => {
   return ['Toàn thời gian cố định', 'Toàn thời gian tạm thời', 'Bán thời gian', 'Bán thời gian tạm thời', 'Hợp đồng', 'Việc làm từ xa', 'Khác'];
};

// hàm lấy dữ liệu cấp bậc làm việc
exports.getDataWorkingRank = async () => {
   return ['Mới tốt nghiệp', 'Thực tập sinh', 'Nhân viên', 'Trưởng nhóm', 'Phó tổ trưởng', 'Tổ trưởng', 'Phó trưởng phòng', 'Trưởng phòng', 'Phó giám đốc', 'Giám đóc', 'Phó tổng giám đốc', 'Tổng giám đốc', 'Quản lý cấp trung', 'Quản lý cấp cao'];
};

// hàm lấy dữ liệu kinh nghiệm làm việc
exports.getDataEXP = async () => {
   return ['Không yêu cầu', 'Chưa có kinh nghiệm', '0 - 1 năm kinh nghiệm', 'Hơn 1 năm kinh nghiệm', 'Hơn 2 năm kinh nghiệm', 'Hơn 5 năm kinh nghiệm', 'Hơn 10 năm kinh nghiệm'];
};
// hàm lấy dữ liệu bằng cấp làm việc
exports.getDataDegree = async () => {
   return ['Không yêu cầu', 'Đại học trở lên', 'Cao đẳng trở lên', 'THPT trở lên', 'Trung học trở lên', 'Chứng chỉ', 'Trung cấp trở lên', 'Cử nhân trở lên', 'Thạc sĩ trở lên', 'Thạc sĩ Nghệ thuật', 'Thạc sĩ Thương mại', 'Thạc sĩ Khoa học', 'Thạc sĩ Kiến trúc', 'Thạc sĩ QTKD', 'Thạc sĩ Kỹ thuật ứng dụng', 'Thạc sĩ Luật', 'Thạc sĩ Y học', 'Thạc sĩ Dược phẩm', 'Tiến sĩ', 'Khác'];
};

// hàm lấy dữ liệu giới tính làm việc
exports.getDataSex = async () => {
   return ['Nam', 'Nữ', 'Không yêu cầu'];
};

exports.pageFind = async (model, condition, sort, skip, limit, select) => {
   return model.find(condition, select).sort(sort).skip(skip).limit(limit).lean();
};

exports.pageFindWithFields = async (model, condition, fields, sort, skip, limit) => {
   return model.find(condition, fields).sort(sort).skip(skip).limit(limit);
};

// lấy danh sách mẫu CV sắp xếp mới nhất
exports.getDataCVSortById = async (condition) => {
   const data = await CV.find(condition).select('_id image name alias price status view love download lang_id design_id cate_id colors').sort({_id: -1});
   if (data.length > 0) {
      return data;
   }
   return null;
};

// lấy danh sách mẫu CV sắp xếp lượt tải nn
exports.getDataCVSortByDownload = async (condition) => {
   const data = await CV.find(condition).select('_id image name alias price status view love download lang_id design_id cate_id colors').sort({download: -1});
   if (data.length > 0) {
      return data;
   }
   return null;
};

//hàm kiểm tra string có phải number không
exports.checkNumber = async (string) => {
   return !isNaN(string);
};

//hàm phân trang có chọn lọc những trường dc hiển thị
exports.pageFindV2 = async (model, condition, select, sort, skip, limit) => {
   return model.find(condition, select).sort(sort).skip(skip).limit(limit);
};

//hàm check xem có truyền vào token hay không
exports.checkTokenV2 = async (req, res, next) => {
   if (req.headers.authorization) {
      checkTokenV3(req, res, next);
   } else {
      next();
   }
};

// hàm dém count
exports.findCount = async (model, filter) => {
   try {
      const count = await model.countDocuments(filter);
      return count;
   } catch (error) {
      console.error(error);
      throw error;
   }
};
//base64 decrypt image
exports.decrypt = async (req, res, next) => {
   const base64 = req.body.base64;
   req.file = Buffer.from(base64, 'base64').toString('utf-8');
   return next();
};
exports.thresholds = [
   {minValue: 1000000, maxValue: 3000000, money: 2},
   {minValue: 3000000, maxValue: 5000000, money: 3},
   {minValue: 5000000, maxValue: 7000000, money: 4},
   {minValue: 7000000, maxValue: 10000000, money: 5},
   {minValue: 10000000, maxValue: 15000000, money: 6},
   {minValue: 15000000, maxValue: 20000000, money: 7},
   {minValue: 20000000, maxValue: 30000000, money: 8},
   {minValue: 30000000, maxValue: 50000000, money: 9},
   {minValue: 50000000, maxValue: 100000000, money: 10},
   {minValue: 100000000, maxValue: Infinity, money: 11},
];
//hàm tìm kiếm finduser với idtimviec và type = 0 hoặc 2
exports.findUser = async (userId, select, sort, skip, limit) => {
   return Users.find(
      {
         $or: [
            {
               idTimViec365: userId,
               type: 0,
            },
            {
               idTimViec365: userId,
               type: 2,
            },
         ],
      },
      {select},
   )
      .sort(sort)
      .skip(skip)
      .limit(limit);
};

//hàm tìm kiếm findOneuser với idtimviec và type = 0 hoặc 2
exports.findOneUser = async (userId, select) => {
   return Users.findOne(
      {
         $or: [
            {
               idTimViec365: userId,
               type: 0,
            },
            {
               idTimViec365: userId,
               type: 2,
            },
         ],
      },
      select,
   ).lean();
};

//hàm tìm kiếm và cập nhật user với id timviec và type =0 hoặc type =2
exports.findOneAndUpdateUser = async (userId, projection) => {
   return Users.findOneAndUpdate(
      {
         $or: [
            {
               idTimViec365: userId,
               type: 0,
            },
            {
               idTimViec365: userId,
               type: 2,
            },
         ],
      },
      projection,
   );
};

exports.getUrlLogoCompany = async (createTime, logo) => {
   try {
      if (logo != null) {
         const time = new Date(createTime);
         let d = time.getDate();
         d = d < 10 ? '0' + d : d;
         let m = time.getMonth() + 1;
         m = m < 10 ? '0' + m : m;
         const y = time.getFullYear();
         return hostImage() + `/pictures/${y}/${m}/${d}/${logo}`;
      } else {
         return logo;
      }
   } catch (error) {
      console.log(error);
   }
};

exports.getTokenUser = async (req, res) => {
   let user = null;
   if (req.headers.authorization) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
         jwt.verify(token, process.env.NODE_SERCET, (err, result) => {
            if (!err) {
               user = result.data;
            }
         });
      }
   }
   return user;
};

// hàm tạo link file rao nhanh 365
exports.createLinkFileRaonhanh = (folder, id, name) => {
   let link = process.env.DOMAIN_RAO_NHANH + '/base365/raonhanh365/pictures/' + folder + '/' + id + '/' + name;
   return link;
};
// hàm kiểm tra đầu vào có phải ngày không
exports.checkDate = (date) => {
   let data = new Date(date);
   return data instanceof Date && !isNaN(data);
};

exports.uploadFileBase64RaoNhanh = async (folder, id, base64String, file) => {
   let path1 = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/`;
   // let filePath = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/` + file.name;
   if (!fs.existsSync(path1)) {
      fs.mkdirSync(path1, {recursive: true});
   }
   var matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
   if (matches.length !== 3) {
      return false;
   }

   let type = matches[1];
   let data = Buffer.from(matches[2], 'base64');

   const imageName = `${Date.now()}.${type.split('/')[1]}`;
   fs.writeFile(path1 + imageName, data, (err) => {
      if (err) {
         console.log(err);
      }
   });
};

// hàm tìm id max Quản Lí Chung
exports.getMaxIDQLC = async (model) => {
   const maxUser = (await model.findOne({}, {}, {sort: {idQLC: -1}}).lean()) || 0;
   return maxUser.idQLC;
};
// hàm tìm idcompany max
exports.getMaxIDcompany = async (model) => {
   const maxIDcompany = (await model.findOne({}, {}, {sort: {companyId: -1}}).lean()) || 0;
   return maxIDcompany.companyId;
};

//upload image cv,don, thu, syll

exports.uploadAndCheckPathIMG = async (userId, imageFile, category) => {
   try {
      // upload
      const timestamp = Date.now();
      const imagePath = await fsPromises.readFile(imageFile.path);
      const uploadDir = `../Storage/TimViec365/${userId}/${category}`;
      const uploadFileName = `${timestamp}_${imageFile.originalFilename}`;
      const uploadPath = path.join(uploadDir, uploadFileName);
      await fsPromises.mkdir(uploadDir, {recursive: true});
      await fsPromises.writeFile(uploadPath, imagePath);
      // tìm và chuyển img sang pdf
      await fsPromises.access(uploadPath);
      const pdfPath = path.join(uploadDir, `${uploadFileName.slice(0, -4)}.pdf`);
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);
      doc.image(uploadPath, 0, 0, {fit: [612, 792]});
      doc.end();

      await new Promise((resolve, reject) => {
         stream.on('finish', resolve);
         stream.on('error', reject);
      });

      console.log('Chuyển đổi ảnh thành PDF thành công.');
      return {
         status: 'EXIT',
         nameImage: uploadFileName,
         imgPath: uploadPath,
         pdfPath: pdfPath,
      };
   } catch (error) {
      if (error.code === 'ENOENT') {
         return 'ENOENT';
      } else {
         return error.message;
      }
   }
};

// hàm  xóa  ảnh và video khi upload thất bại
exports.deleteImgVideo = async (avatar = undefined, video = undefined) => {
   if (avatar) {
      avatar.forEach(async (element) => {
         await this.deleteImg(element);
      });
   }
   if (video) {
      video.forEach(async (element) => {
         await this.deleteImg(element);
      });
   }
};

//thay thế các kí tự đặc biệt trong tiêu đề
exports.replaceKeywordSearch = async (lower, keyword) => {
   if (lower === 1) {
      keyword = keyword.toLowerCase();
   }
   const arrRep = ["'", '"', '-', '\\+', '=', '\\*', '\\?', '\\/', '!', '~', '#', '@', '%', '$', '\\^', '&', '\\(', '\\)', ';', ':', '\\\\', '\\.', ',', '\\[', '\\]', '{', '}', '‘', '’', '“', '”', '<', '>'];
   keyword = arrRep.reduce((str, rep) => {
      return str.replace(new RegExp(rep, 'g'), ' ');
   }, keyword);
   keyword = keyword.replace(/ {2,}/g, ' ');
   return keyword;
};

exports.replaceMQ = async (text) => {
   text = text.replace(/\\'/g, "'");
   text = text.replace(/'/g, '');
   text = text.replace(/\\/g, '');
   text = text.replace(/"/g, '');
   return text;
};

//bỏ những từ khóa trong tiêu đề
exports.removerTinlq = async (string) => {
   var arr_remove = ['lương', 'nhân', 'trình', 'viên', 'chuyên', 'cao', 'tuyển', 'dụng', 'hấp', 'dẫn', 'chi', 'tiết', 'công', 'ty', 'tnhh', 'sx', 'tm', 'dv', 'phòng', 'tại', 'biết', 'về'];
   var result = arr_remove.reduce(function (str, remove) {
      return str.replace(new RegExp(remove, 'gi'), '');
   }, string);

   result = result.trim().replace(/\s+/g, ' '); // Loại bỏ khoảng trắng dư thừa

   return result;
};

exports.getMaxUserID = async (type = 'user') => {
   let condition = {};
   if (type == 'user') {
      condition = {type: {$ne: 1}};
   } else {
      condition = {type: 1};
   }

   // ID Chat
   const maxID = await Users.findOne({}, {_id: 1}).sort({_id: -1}).limit(1).lean();
   if (maxID) {
      _id = Number(maxID._id) + 1;
   } else _id = 1;

   // ID timviec365
   const maxIDTimviec = await Users.findOne(condition, {idTimViec365: 1}).sort({idTimViec365: -1}).lean();
   if (maxIDTimviec) {
      _idTV365 = Number(maxIDTimviec.idTimViec365) + 1;
   } else _idTV365 = 1;

   // ID chuyển đổi số
   const maxIdQLC = await Users.findOne(condition, {idQLC: 1}).sort({idQLC: -1}).lean();
   if (maxIdQLC) {
      _idQLC = Number(maxIdQLC.idQLC) + 1;
   } else _idQLC = 1;

   // ID raonhanh365
   const maxIdRN365 = await Users.findOne(condition, {idRaoNhanh365: 1}).sort({idRaoNhanh365: -1}).lean();
   if (maxIdRN365) {
      _idRN365 = Number(maxIdRN365.idRaoNhanh365) + 1;
   } else _idRN365 = 1;

   return {_id, _idTV365, _idQLC, _idRN365};
};

const hostImage = () => {
   return 'https://cdn.timviec365.vn';
};

exports.hostCDN = () => {
   return hostImage();
};

exports.getPictureBlogTv365 = (picture) => {
   return hostImage() + '/pictures/news/' + picture;
};

exports.getPictureCv = (picture) => {
   return hostImage() + '/cv365/upload/cv/thumb/' + picture;
};

exports.getPictureAppli = (picture) => {
   return hostImage() + '/cv365/upload/donxinviec/thumb/' + picture;
};

exports.getPictureLetter = (picture) => {
   return hostImage() + '/cv365/upload/letter/thumb/' + picture;
};

exports.getPictureResume = (picture) => {
   return hostImage() + '/cv365/upload/hoso/thumb/' + picture;
};

exports.clean_sp = (string) => {
   var arr_str = ['<', '>', '/'];
   var string = string.replace(new RegExp(arr_str.join('|'), 'g'), ' ');
   var array = {
      '    ': ' ',
      '   ': ' ',
      '  ': ' ',
   };
   string = string.trim().replace(/ {2,}/g, function (match) {
      return array[match];
   });
   return string;
};

exports.processBase64 = async (userId, nameImage, base64String) => {
   const dir = `../storage/base365/timviec365/cv365/upload/ungvien/uv_${userId}`;

   if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
   }

   // Đường dẫn tới nơi bạn muốn lưu ảnh
   const outputPath = `${dir}/${nameImage}.jpg`;

   // Xóa đầu mục của chuỗi Base64 (ví dụ: "data:image/png;base64,")
   const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

   // Giải mã chuỗi Base64 thành dữ liệu nhị phân
   const imageBuffer = Buffer.from(base64Data, 'base64');

   // Ghi dữ liệu nhị phân vào tệp ảnh
   fs.writeFile(outputPath, imageBuffer, (error) => {
      if (error) {
         console.error('Lỗi khi ghi tệp ảnh');
         return false;
      } else {
         console.log('Chuyển đổi thành công! Tệp ảnh đã được lưu tại:' + outputPath);
      }
   });
   const checkImage = await this.checkImage(outputPath);

   return checkImage;
};

// hàm random
exports.getRandomInt = (min, max) => {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.new_money_tv = async (nm_id, nm_type, nm_unit, nm_min_value, nm_max_value, new_money) => {
   let array_muc_luong = ['Chọn mức lương', 'Thỏa thuận', '1 - 3 triệu', '3 - 5 triệu', '5 - 7 triệu', '7 - 10 triệu', '10 - 15 triệu', '15 - 20 triệu', '20 - 30 triệu', 'Trên 30 triệu', 'Trên 50 triệu', 'Trên 100 triệu'];
   let array_tien_te = {
      1: 'VNĐ',
      2: 'USD',
      3: 'EUR',
   };
   if (nm_id !== '') {
      var rd_muc_luong = '';
      switch (nm_type) {
         case 2:
            rd_muc_luong = 'Từ ' + formatMoney(nm_min_value) + ' ' + array_tien_te[nm_unit];
            break;
         case 3:
            rd_muc_luong = 'Đến ' + formatMoney(nm_max_value) + ' ' + array_tien_te[nm_unit];
            break;
         case 4:
            rd_muc_luong = 'Từ ' + formatMoney(nm_min_value) + ' ' + array_tien_te[nm_unit] + ' Đến ' + formatMoney(nm_max_value) + ' ' + array_tien_te[nm_unit];
            break;
         default:
            rd_muc_luong = array_muc_luong[new_money];
            break;
      }
   } else {
      rd_muc_luong = array_muc_luong[new_money];
   }
   if (rd_muc_luong === '' || rd_muc_luong === 'Chọn mức lương') {
      rd_muc_luong = 'Thỏa Thuận';
   }
   return rd_muc_luong;
};

exports.hostCvUvUpload = async (userid, image) => {
   return `${hostImage()}/upload/ungvien/uv_${userid}/${image}.jpg`;
};

exports.siteName = () => {
   return 'https://dev.timviec365.vn';
};

exports.renderCDNImage = (content) => {
   if (content != '') {
      return content.replaceAll('src="', 'src="' + hostImage());
   }
   return content;
};

exports.imageCv = (uv_id, name_img) => {
   return `${hostImage()}/cv365/upload/ungvien/uv_${uv_id}/${name_img}.png`;
};

exports.getTimeNow = () => {
   return Math.floor(Date.now() / 1000);
};

exports.folderUploadImageAvatar = (createTime) => {
   const time = new Date(createTime);
   let d = time.getDate();
   d = d < 10 ? '0' + d : d;
   let m = time.getMonth() + 1;
   m = m < 10 ? '0' + m : m;
   const y = time.getFullYear();
   return `../storage/base365/timviec365/pictures/uv/${y}/${m}/${d}/`;
};

exports.cdnImageAvatar = (createTime) => {
   const time = new Date(createTime),
      y = time.getFullYear();
   let d = time.getDate();
   d = d < 10 ? '0' + d : d;
   let m = time.getMonth() + 1;
   m = m < 10 ? '0' + m : m;
   return `${hostImage()}/pictures/uv/${y}/${m}/${d}/`;
};

exports.convertDate = (time = null, revert = false) => {
   let date;
   if (time != null) {
      date = new Date(time * 1000);
   } else {
      date = new Date();
   }
   const y = date.getFullYear();
   let d = date.getDate();
   d = d < 10 ? '0' + d : d;
   let m = date.getMonth() + 1;
   m = m < 10 ? '0' + m : m;
   if (!revert) {
      return `${d}/${m}/${y}`;
   } else {
      return `${y}/${m}/${d}`;
   }
};

exports.formatMoney = (number, fractional = false) => {
   if (fractional) {
      number = parseFloat(number).toFixed(2);
   }
   while (true) {
      const replaced = number.replace(/(-?\d+)(\d\d\d)/, '$1.$2');
      if (replaced !== number) {
         number = replaced;
      } else {
         break;
      }
   }
   return number;
};
