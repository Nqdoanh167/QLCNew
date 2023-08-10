const express = require('express');
const router = express.Router();
const formData = require('express-form-data');
const Controller = require('../../../controllers/vanthu/DeXuat/create_dx');
const functions = require('../../../services/functions')


router.post('/De_Xuat_Xin_Nghi', functions.checkToken, formData.parse(), Controller.de_xuat_xin_nghi);
router.post('/De_Xuat_Xin_Bo_Nhiem', functions.checkToken, formData.parse(), Controller.de_xuat_xin_bo_nhiem);
router.post('/De_Xuat_Cap_Phat_Tai_San', functions.checkToken, formData.parse(), Controller.de_xuat_xin_cap_phat_tai_san);
router.post('/De_Xuat_Xin_Doi_Ca', functions.checkToken, formData.parse(), Controller.de_xuat_doi_ca);
router.post('/De_Xuat_Luan_Chuyen_Cong_Tac', functions.checkToken, formData.parse(), Controller.de_xuat_luan_chuyen_cong_tac);
router.post('/De_Xuat_Xin_Tang_Luong', functions.checkToken, formData.parse(), Controller.de_xuat_tang_luong);
router.post('/De_Xuat_Tham_Gia_Du_An', functions.checkToken, formData.parse(), Controller.de_xuat_tham_gia_du_an);
router.post('/De_Xuat_Xin_Tam_Ung', functions.checkToken, formData.parse(), Controller.de_xuat_xin_tam_ung);
router.post('/De_Xuat_Xin_thoi_Viec', functions.checkToken, formData.parse(), Controller.de_xuat_xin_thoi_Viec);
router.post('/De_Xuat_Lich_Lam_Viec', functions.checkToken, formData.parse(), Controller.lich_lam_viec);

router.post('/addDXC', functions.checkToken, formData.parse(), Controller.dxCong);
router.post('/addDXVC', functions.checkToken, formData.parse(), Controller.dxCoSoVatChat)
router.post('/addDXXe', functions.checkToken, formData.parse(), Controller.dxDangKiSuDungXe)
router.post('/addDXHH', functions.checkToken, formData.parse(), Controller.dxHoaHong)
router.post('/addDXKN', functions.checkToken, formData.parse(), Controller.dxKhieuNai)
router.post('/addDxPh', functions.checkToken, formData.parse(), Controller.dxPhongHop)
router.post('/addDxTc', functions.checkToken, formData.parse(), Controller.dxTangCa)
router.post('/addDxTs', functions.checkToken, formData.parse(), Controller.dxThaiSan)
router.post('/addDXTT', functions.checkToken, formData.parse(), Controller.dxThanhToan)
router.post('/addDXTP', functions.checkToken, formData.parse(), Controller.dxThuongPhat)

router.post('/addDXDMVS', functions.checkToken, formData.parse(), Controller.dxDiMuonVeSom)
router.post('/addDXXNRN', functions.checkToken, formData.parse(), Controller.dxXinNghiRaNgoai)
router.post('/addDXNNNL', functions.checkToken, formData.parse(), Controller.dxNhapNgayNhanLuong)
router.post('/addDXXTTL', functions.checkToken, formData.parse(), Controller.dxXinTaiTaiLieu)

module.exports = router;