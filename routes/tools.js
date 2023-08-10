var express = require("express");
var router = express.Router();
var toolUser = require("../controllers/tools/user");
var toolTimviec365 = require("../controllers/tools/timviec365");
const formData = require("express-form-data");

// API quét data người dùng từ base chat
router.post("/addUserChat365", formData.parse(), toolUser.addUserChat365);
router.get("/addUserCompanyTimviec365", toolUser.addUserCompanyTimviec365);
router.get("/addUserCandidateTimviec365", toolUser.addUserCandidateTimviec365);
router.get("/deleteUser", toolUser.deleteUser);
router.get("/resetScan", toolUser.resetScan);
router.post("/addCompanyTv365", formData.parse(), toolUser.addCompanyTv365);
router.post("/addCandidateTv365", formData.parse(), toolUser.addCandidateTv365);
router.post("/addEmployee", formData.parse(), toolUser.addEmployee);

// api quét data keywork
router.get("/addKeyword", toolTimviec365.toolKeyword);

// api quét data admin user
router.get("/toolAddAdminUSer", toolTimviec365.toolAddAdminUSer);

// api quét data lĩnh vực
router.get("/toolLV", toolTimviec365.toolLV);

// api quét data newTV365
router.get("/toolNewTV365", toolTimviec365.toolNewTV365);

// api quét data newTV365
router.get("/toolNewMultiTV365", toolTimviec365.toolNewMultiTV365);

// api quét data newTV365
router.get("/toolNewMoney", toolTimviec365.toolNewMoney);

// api quét data mẫu cv
router.get("/toolCV", toolTimviec365.toolCV);

// api quét data category blog
router.get("/toolCategoryBlog", toolTimviec365.toolCategoryBlog);

// api quét data category blog
router.get("/toolBlog", toolTimviec365.toolBlog);

// api quét data danh sách ngành cv
router.get("/toolCVCategory", toolTimviec365.toolCVCategory);

// api quét data cv của ứng viên
router.get("/toolCVUV", toolTimviec365.toolCVUV);

// api quét data ngon ngu cv
router.get("/toolCVLang", toolTimviec365.toolCVLang);

// api quét data mẫu đơn xin việc
router.get("/toolApplication", toolTimviec365.toolApplication);

// api quét data đơn của UV
router.get("/toolApplicationUV", toolTimviec365.toolApplicationUV);

// api quét data thu của UV
router.get("/toolLetterUV", toolTimviec365.toolLetterUV);

// api quét data syll của UV
router.get("/toolResumeUV", toolTimviec365.toolResumeUV);

// api quét data mẫu thư
router.get("/toolLetter", toolTimviec365.toolLetter);

// api quét data mẫu syll
router.get("/toolResume", toolTimviec365.toolResume);

// api quét data thiết kế cv
router.get("/toolCVDesign", toolTimviec365.toolCVDesign);

// api quét data nhom cv
router.get("/toolCVGroup", toolTimviec365.toolCVGroup);

// api quét data bảng giá
router.get("/toolPriceList", toolTimviec365.toolPriceList);

// api quét data chuyên mục
router.get("/toolCVSection", toolTimviec365.toolCVSection);

// api quét data poincompany
router.get("/toolPoinCompany", toolTimviec365.toolPoinCompany);

// api quét data PointUse
router.get("/toolPointUse", toolTimviec365.toolPointUse);

// api quét data nganh don
router.get("/toolNganhDon", toolTimviec365.toolNganhDon);

// api quét data nganh thu
router.get("/toolNganhThu", toolTimviec365.toolNganhThu);
router.get("/toolTagBlog", toolTimviec365.toolTagBlog);
router.get("/toolNewAuthor", toolTimviec365.toolNewAuthor);
router.get("/CateInterViewQuestion", toolTimviec365.CateInterViewQuestion);
router.get("/new_bo_de", toolTimviec365.new_bo_de);
router.get("/bieu_mau_tag", toolTimviec365.bieu_mau_tag);
router.get("/category_des", toolTimviec365.category_des);
router.get("/tbl_modules", toolTimviec365.tbl_modules);
router.get("/commentPost", toolTimviec365.commentPost);
router.get("/likePost", toolTimviec365.likePost);
router.get("/Cv365Like", toolTimviec365.Cv365Like);
router.get("/Cv365TblModules", toolTimviec365.Cv365TblModules);
router.get("/Cv365TblFooter", toolTimviec365.Cv365TblFooter);
router.get("/bieumau", toolTimviec365.bieumau);
router.get("/BieuMauNew", toolTimviec365.BieuMauNew);
router.get("/BieuMauTag", toolTimviec365.BieuMauTag);
router.get("/TrangVangCategory", toolTimviec365.TrangVangCategory);
router.get("/KeyWordSSL", toolTimviec365.KeyWordSSL);
router.get("/ApplyForJob", toolTimviec365.ApplyForJob);
router.get("/PermissionNotify", toolTimviec365.PermissionNotify);
router.get("/Profile", toolTimviec365.Profile);
router.get("/UserSavePost", toolTimviec365.UserSavePost);
router.get("/Notification", toolTimviec365.Notification);
router.get("/SaveVote", toolTimviec365.SaveVote);
router.get("/TblHistoryViewd", toolTimviec365.TblHistoryViewd);
router.get("/HistoryNewPoint", toolTimviec365.HistoryNewPoint);
router.get("/Evaluate", toolTimviec365.Evaluate);
router.get("/CompanyStorage", toolTimviec365.CompanyStorage);
router.get("/checkRegistry", toolTimviec365.checkRegistry);

module.exports = router;