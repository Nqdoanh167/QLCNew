const AdminUser = require('../../../models/AdminUser');
const HistoryDX = require('../../../models/Vanthu/history_handling_dx');
const functions = require("../../../services/functions");
const DeXuat = require('../../../models/Vanthu/de_xuat')

exports.showAllHis = async(req,res) => {
    try {
      
        const showHistory = await HistoryDX.find();
        res.status(200).json(showHistory)
    } catch (error) {
        console.error('Failed to get history', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
}


// Hàm hiển thị đề xuất đã tạo
// exports.Isend = async (req, res) => {
//   try {
//     const {id_user} = req.body;
//     if(!id_user){
//         return res.status(404).json('bad request')
//     }else{
//         const createdProposals = await DeXuat.find({ id_user });
//         if (createdProposals.length === 0) {
//             return res.status(404).json({ error: 'Không tìm thấy đề xuất đã tạo.' });
//           } 
//           const proposalIds = createdProposals.map(proposal => proposal._id);
//     const history = await HistoryDX.find({ id_dx: { $in: proposalIds } });
//     }
   

//     // Gửi kết quả về client
//     res.json({ createdProposals, history });
//   } catch (error) {
//     res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình xử lý.' });
//   }
// };


// Hàm hiển thị đề xuất đã tạo dựa trên id_user
exports.Isend = async (req, res) => {
  try {
    const { id_user } = req.body;
    
    // Kiểm tra nếu id_user không được gửi
    if (!id_user) {
      return res.status(400).json({ error: 'id_user không được bỏ trống.' });
    }

    // Lấy danh sách các đề xuất đã tạo bởi id_user
    const createdProposals = await DeXuat.find({ id_user });

    // Kiểm tra nếu không tìm thấy đề xuất
    if (createdProposals.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đề xuất đã tạo.' });
    }

    // Lấy danh sách lịch sử xử lý của các đề xuất đã tạo
    const proposalIds = createdProposals.map(proposal => proposal._id);
    const history = await HistoryDX.find({ id_dx: { $in: proposalIds } });

    // Gửi kết quả về client
    res.json({ createdProposals, history });
  } catch (error) {
    res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình xử lý.' });
  }
};


exports.SendToMe = async(req,res) => {
    try{
        const { id_user } = req.body;
    // Kiểm tra nếu id_user không được gửi
        if(!id_user){
            return res.status(400).json({ error: 'id_user không được bỏ trống.' });
        }
     // Lấy danh sách các đề xuất đã tạo bởi id_user và người nhận là id_user_duyet    

    }catch (error) {
        res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình xử lý.' });
      }
}
