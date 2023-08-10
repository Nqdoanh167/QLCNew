const router = require('express').Router();
const functions = require("../../services/functions");
const InvitationController = require("../../controllers/qlcnew/invitation")
const formData = require('express-form-data')
//Lấy tất cả lời mời

router.get("/", formData.parse(), InvitationController.getAllInvation);

//Lấy các lời mời được accepted
router.get("/accepted", formData.parse(), InvitationController.getAceptedInvitation);

//lấy các lời mời bị denied
router.get("/denied", formData.parse(), InvitationController.getDeniedInvitation);

//lấy các lời mời đang pending
router.get("/pending", formData.parse(), InvitationController.getPendingInvitation);

//lấy các lời mời bị expried
router.get("/expired", formData.parse(), InvitationController.getExpiredInvitation);

//xem thông tin chi tiết lời mời
router.get("/:id", formData.parse(), InvitationController.getInvitationDetailById);

// Xóa một lời mời
router.delete("/:id", formData.parse(), InvitationController.deleteInvitation);

// Sửa một lời mời
router.post("/:id", formData.parse(), InvitationController.editInvitation);

module.exports = router







