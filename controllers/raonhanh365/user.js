const functions = require('../../services/functions');
const Category = require('../../models/Raonhanh365/Category');
const New = require('../../models/Raonhanh365/New');
const CategoryRaoNhanh365 = require('../../models/Raonhanh365/Category');
const User = require('../../models/Users');
const LoveNews = require('../../models/Raonhanh365/LoveNews');
const Order = require('../../models/Raonhanh365/Order');
const Bidding = require('../../models/Raonhanh365/Bidding');
const md5 = require('md5');
const raoNhanh = require('../../services/rao nhanh/raoNhanh');
const History = require('../../models/Raonhanh365/History');
const Evaluate = require('../../models/Raonhanh365/Evaluate');


const folderUserImg = "img_user"
// gửi otp
exports.changePasswordSendOTP = async (req, res, next) => {
    try {
        let id = req.user.data._id;
        let otp = await functions.randomNumber;
        let data = {
            UserID: 637990,
            SenderID: 1191,
            MessageType: 'text',
            Message: `[RaoNhanh365 - OTP đổi mật khẩu]
                     Chúng tôi nhận được yêu cầu đổi mật khẩu tài khoản của bạn trên Raonhanh365.vn. Mã OTP của bạn là: ${otp}.`
        }
        await functions.getDataAxios('http://43.239.223.142:9000/api/message/SendMessageIdChat', data)
        await User.findByIdAndUpdate(id, { otp })
        return functions.success(res, 'update thành công')
    } catch (error) {
        return functions.setError(res, error)
    }
}

// kiểm tra OTP
exports.changePasswordCheckOTP = async (req, res, next) => {
    try {
        let otp = req.body.otp;
        let userID = req.user.data._id;
        if (otp) {
            let verify = await User.findOne({ _id: userID, otp });
            if (verify) {
                return functions.success(res, 'Xác thực thành công')
            } else {
                return functions.success(res, 'Mã otp không chính xác', 404)
            }
        } else {
            return functions.setError(res, 'Vui lòng nhập otp ', 400)
        }
    } catch (error) {
        return functions.setError(res, error)
    }
}

// hàm đổi mật khẩu 
exports.changePassword = async (req, res, next) => {
    try {
        let userID = req.user.data._id;
        let password = req.body.password;
        let re_password = req.body.re_password;
        if (!password || !re_password) {
            return functions.setError(res, 'Missing data', 400)
        }
        if (password.length < 6) {
            return functions.setError(res, 'Password quá ngắn', 400)
        }
        if (password !== re_password) {
            return functions.setError(res, 'Password nhập lại không trùng khớp', 400)
        }
        await User.findByIdAndUpdate(userID, { password: md5(password) });
        return functions.success(res, 'đổi mật khẩu thành công')
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// chỉnh sửa thông tin tài khoản
exports.updateInfoUserRaoNhanh = async (req, res, next) => {
    try {
        let _id = req.user.data._id;

        let { userName, email, address } = req.body;
        let updatedAt = new Date(Date.now());

        if ((await functions.checkEmail(email)) === false) {
            return functions.setError(res, "invalid email");
        } else {
            let check_email = await User.findById(_id);
            if (check_email.email !== email) {
                let check_email_lan2 = await User.find({ email });
                if (check_email_lan2.length !== 0) {
                    return functions.setError(res, "email is exits");
                }
            }
        }
        await User.findByIdAndUpdate(_id, { email, address, userName, updatedAt });
        return functions.success(res, "update data user success");
    } catch (error) {
        return functions.setError(res, error);
    }
};

// thông báo kết quả đấu thầu
exports.announceResult = async (req, res, next) => {
    try {
        let { status, id_dauthau } = req.body;
        if (!status || !id_dauthau) {
            return functions.setError(res, 'missing data', 400);
        }
        if (await functions.checkNumber(status) === false || await functions.checkNumber(id_dauthau) === false) {
            return functions.setError(res, 'invalid number', 400);
        }
        let data = await Bidding.findById(id_dauthau);
        if (!data) {
            return functions.setError(res, 'not exits', 400);
        }
        if (data.updatedAt) {
            return functions.setError(res, 'Chỉ được cập nhật 1 lần', 400);
        }
        let updatedAt = new Date(Date.now())
        await Bidding.findByIdAndUpdate(id_dauthau, { status, updatedAt })
        return functions.success(res, 'Thông báo thành công')
    } catch (error) {
        return functions.setError(res, error)
    }
}

// danh sách khách hàng online
exports.listUserOnline = async (req, res, next) => {
    try {
        let data = [];
            data = await User.aggregate([
                {
                    $lookup: {
                        from: "RN365_News",
                        localField: "idRaoNhanh365",
                        foreignField: "userID",
                        as: "new"
                    }
                },
                {
                    $match: { isOnline: 1 }
                }, {
                    $project: { userName: 1, avatarUser: 1,idRaoNhanh365:1, _id:1, type: 1,city:1,district:1,address:1}
                }, {
                    $limit: 20
                }
            ]);
        for(let i = 0 ; i < data.length; i++)
        {
            let tin = await  New.findOne({userID:data[i].idRaoNhanh365},{ title: 1,_id:1,linkTitle: 1,type: 1})       
            data[i].tin = tin 
        }
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.log("🚀 ~ file: user.js:161 ~ exports.listUserOnline= ~ error:", error)
        return functions.setError(res, error)
    }
}

// lịch sử giao dịch
exports.historyTransaction = async (req, res, next) => {
    try {
        let userId = req.user.data.idRaoNhanh365;
        let data = await History.find({ userId })
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        return functions.setError(res, error)
    }
}
exports.createVerifyPayment = async(req, res, next) => {
    try {
        let cccdFrontImg = req.files.cccdFrontImg;
        let cccdBackImg = req.files.cccdBackImg;
        let {userId, cccd, phoneContact, bank, stk, ownerName} = req.body;
        if(!userId || !cccd || !phoneContact || !bank || !stk || !ownerName){
            return functions.setError(res, "Missing input value!", 404);
        }
        let user = await User.findOne({_id: userId}, {userName: 1});
        if(!user)
            return functions.setError(res, "User not fount!", 404);
        
        
        if(!await functions.checkImage(cccdFrontImg.path)){
            return functions.setError(res, 'ảnh sai định dạng hoặc lớn hơn 2MB', 405);
        }
        if(!await functions.checkImage(cccdBackImg.path)){
            return functions.setError(res, 'ảnh sai định dạng hoặc lớn hơn 2MB', 405);
        }
        raoNhanh.uploadFileRN2(folderUserImg,userId,cccdFrontImg);
        cccdFrontImg = functions.createLinkFileRaonhanh(folderUserImg, userId, cccdFrontImg.name);

        raoNhanh.uploadFileRN2(folderUserImg,userId,cccdBackImg);
        cccdBackImg = functions.createLinkFileRaonhanh(folderUserImg, userId, cccdBackImg.name);
        await User.findOneAndUpdate({_id: userId}, {
            phone: phoneContact,
            inforRN365: {
                cccd: cccd,
                cccdFrontImg: cccdFrontImg,
                cccdBackImg: cccdBackImg,
                bankName: bank,
                stk: stk,
                ownerName: ownerName,
                time: Date(Date.now()),
                active: 1
            }
        })
        return functions.success(res, 'Create verify payment success!');
    } catch (e) {
        console.log("Err from server!", e);
        return functions.setError(res, "Err from server!", 500);
    }
}

// tổng quan thông tin tài khoản cá nhân
exports.profileInformation = async (req,res,next) => {
    try{
        let userIdRaoNhanh = req.body.userId;
        
        let fields = {userName: 1,phone: 1, type: 1, email: 1, address: 1,
            createdAt: 1, money: 1,idRaoNhanh365:1,phoneTK:1,avatarUser:1,type:1,
            _id:1,emailContact:1,chat365_secret:1
        };
        let dataUser = {}

        //thong tin tk
        let userInFor = await User.findOne({_id: userIdRaoNhanh}, fields);

        //tin da dang
        let numberOfNew = await New.find({userID: userIdRaoNhanh, active: 1}).count();
        
        //tin da dang trong 30
        var currentDate = new Date();  // Lấy ngày hiện tại
        var thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));  // Trừ 30 ngày từ ngày hiện tại
        let numberOfNewNgay = await New.find({userID: userIdRaoNhanh, active: 1, updateTime: {$gte: thirtyDaysAgo, $lte: currentDate}}).count();

        //tin da ban
        let numberOfNewSold = await New.find({userID: userIdRaoNhanh, active: 1, sold: 1}).count();
        
        //tin da ban trong 30
        let numberOfNewNgaySold = await New.find({userID: userIdRaoNhanh, active: 1, sold: 1, updateTime: {$gte: thirtyDaysAgo, $lte: currentDate}}).count();

        //so luong danh gia va so sao
        let listEvaluate = await Evaluate.find({userId: userIdRaoNhanh, newId: 0, active: 1}, {_id: 1, stars: 1,userId:1,blUser:1,parentId:1,comment:1,time:1,active:1,csbl:1,tgianHetcs:1,csuaBl:1});
        let numberEvaluate = await Evaluate.countDocuments({userId: userIdRaoNhanh, newId: 0, active: 1});
        let numberStar = 0;
        for(let i=0; i<listEvaluate.length; i++) {
            numberStar += listEvaluate[i].stars;
        }
        // numberEvaluate = listEvaluate.count();

        fields = {_id: 1, image: 1, title: 1, createTime: 1, updateTime: 1, address: 1, money: 1, sold: 1, unit: 1,
        cateID: 1, linkTitle: 1, free: 1, img: 1,userID:1,type:1,dia_chi:1,endvalue:1,img:1,until:1,address:1}
        //tin dang ban
        let listSellNews = await New.find({userID: userIdRaoNhanh, active: 1, buySell: 2}, fields);

        //tin dang mua
        let listBuyNews = await New.find({userID: userIdRaoNhanh, active: 1, buySell: 1}, fields);

        // let numberOfNewSold = await New.find({userID: userID, sold: 1}).count();
        let likeNew = await LoveNews.find({userID: userIdRaoNhanh}).count()
        dataUser.InforUser = userInFor;
        dataUser.numberOfNew = numberOfNew;
        dataUser.numberOfNewNgay = numberOfNewNgay;
        dataUser.numberOfNewSold = numberOfNewSold;
        dataUser.numberOfNewNgaySold = numberOfNewNgaySold;
        dataUser.evaluate = {numberEvaluate, numberStar};
        dataUser.likeCount = likeNew
        dataUser.listSellNews = listSellNews;
        dataUser.listBuyNews = listBuyNews;

        return functions.success(res, 'get Data User Success', {dataUser});
    } catch(err){
        console.log("Err from server", err);
        return functions.setError(res, "Err from server", 500);
    }
}


// api đổi avatar
exports.updateAvatar = async (req, res, next) => {
    try {
        let _id = req.user.data.idRaoNhanh365;

        let File = req.files || null;
        let avatarUser = null;
        if (File) {
            let upload = raoNhanh.uploadFileRaoNhanh(
                "img_user",
                _id,
                File.avatarUser,
                [".jpeg", ".jpg", ".png"]
            );
            if (!upload) {
                return functions.setError(res, "Định dạng ảnh không hợp lệ");
            }
            avatarUser = functions.createLinkFileRaonhanh(
                "img_user",
                _id,
                File.avatarUser.name
            );
            await User.findByIdAndUpdate(_id, {
                avatarUser
            });
        }
        return functions.success(res, "update data user success");
    } catch (error) {
        return functions.setError(res, error);
    }
};