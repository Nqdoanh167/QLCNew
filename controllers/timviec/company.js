const md5 = require('md5');

// Load models
const Users = require('../../models/Users');
const functions = require('../../services/functions');
const ApplyForJob = require('../../models/Timviec365/UserOnSite/Candicate/ApplyForJob');
const NewTV365 = require('../../models/Timviec365/UserOnSite/Company/New');
const SaveCandidate = require('../../models/Timviec365/UserOnSite/Company/SaveCandidate');
const PointCompany = require('../../models/Timviec365/UserOnSite/Company/ManagerPoint/PointCompany');
const PointUsed = require('../../models/Timviec365/UserOnSite/Company/ManagerPoint/PointUsed');
const CompanyUnset = require('../../models/Timviec365/UserOnSite/Company/UserCompanyUnset');
const AdminUser = require('../../models/Timviec365/Admin/AdminUser');
const CategoryCompany = require('../../models/Timviec365/UserOnSite/Company/CategoryCompany')
const CV = require('../../models/Timviec365/CV/Cv365')
const TagBlog = require('../../models/Timviec365/Blog/TagBlog');
const CompanyStorage = require('../../models/Timviec365/UserOnSite/Company/Storage');


// Load service
const service = require('../../services/timviec365/company');
const servicePermissionNotify = require('../../services/timviec365/PermissionNotify');
const sendMail = require('../../services/timviec365/sendMail');
const multer = require('multer');
const fs = require('fs');

// Check email tồn tại
exports.checkExistEmail = async(req, res) => {
    try {
        const email = req.body.email;
        if (email) {
            const checkEmail = await Users.findOne({
                email: email,
                "inForCompany.timviec365.usc_md5": "",
                type: 1
            }).lean();
            if (!checkEmail) {
                return functions.success(res, "email có thể sử dụng để đăng ký");
            }
            return functions.setError(res, "Email đã tồn tại.")
        }
        return functions.setError(res, "Chưa truyền email");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error)
    }
}

// Check tên công ty
exports.checkExistName = async(req, res) => {
    try {
        const nameCompany = req.body.nameCompany;
        if (nameCompany) {
            const company = await Users.findOne({
                userName: { $regex: new RegExp('^' + nameCompany + '$', 'i') }
            }, {
                email: 1,
                phoneTK: 1
            }).lean();
            if (!company) {
                return functions.success(res, "Tên công ty có thể sử dụng để đăng ký", {
                    account: ""
                });
            }
            return functions.success(res, "Tên công ty đã được sử dụng", {
                account: company.email != null ? company.email : company.phoneTK
            });
        }
        return functions.setError(res, "Chưa truyền tên công ty");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error)
    }
}

// hàm đăng ký
exports.register = async(req, res, next) => {
    try {
        let request = req.body,
            email = request.email,
            password = request.password,
            username = request.usc_name,
            city = request.usc_city,
            district = request.usc_qh,
            address = request.usc_address,
            phone = request.phone,
            description = request.usc_mota,
            linkVideo = request.linkVideo,
            fromDevice = request.fromDevice,
            fromWeb = request.fromWeb;

        // check dữ liệu không bị undefined
        if ((username && password && city && district &&
                address && email && phone) !== undefined) {
            // validate email,phone
            let CheckEmail = await functions.checkEmail(email),
                CheckPhoneNumber = await functions.checkPhoneNumber(phone);

            if (CheckPhoneNumber && CheckEmail) {
                //  check email co trong trong database hay khong
                let user = await functions.getDatafindOne(Users, { email, type: 1 });
                if (user == null) {

                    if (JSON.stringify(req.files) !== '{}') {
                        let totalSize = 0;
                        const storage = req.files.storage;
                        // Tính tổng dung lượng file tải lên
                        storage.forEach(file => {
                            totalSize += file.size;
                        });

                        if (totalSize > functions.MAX_STORAGE) {
                            return functions.setError(res, 'Dung lượng file tải lên vượt quá 300MB');
                        }
                    }

                    // Lấy ID lĩnh vực
                    const lvID = await service.recognition_tag_company(username, description);

                    // Lấy ID kinh doanh sau khi được chia
                    const kd = await service.shareCompanyToAdmin();

                    // Lấy id mới nhất
                    const getMaxUserID = await functions.getMaxUserID("company");
                    // data gửi đến bộ phận nhân sự qua app chat
                    // let dataSendChatApp = {
                    //     ContactId: kd.emp_id,
                    //     SenderID: 1191,
                    //     MessageType: 'text',
                    //     Message: `${username} vừa đăng ký tài khoản nhà tuyển dụng trên timviec365.vn`,
                    //     LiveChat: { "ClientId": "200504_liveChatV2", "ClientName": username, "FromWeb": "timviec365.vn", "FromConversation": "506685" },
                    //     InfoSupport: { "Title": "Hỗ trợ", "Status": 1 },
                    //     MessageInforSupport: `Xin chào, tôi tên là ${username},SĐT: ${phone} `,
                    //     Email: `${email},tôi vừa đăng ký tài khoản NTD trên timviec365.vn,tôi cần bạn hỗ trợ !`
                    // }

                    const otp = Math.floor(Math.random() * 900000) + 100000;

                    const data = {
                        _id: getMaxUserID._id,
                        email: email,
                        password: md5(password),
                        phone: phone,
                        userName: username,
                        type: 1,
                        city: city,
                        district: district,
                        address: address,
                        otp: otp,
                        isOnline: 1,
                        createdAt: functions.getTimeNow(),
                        updatedAt: functions.getTimeNow(),
                        role: 1,
                        authentic: 0,
                        fromWeb: fromWeb || null,
                        fromDevice: fromDevice || null,
                        idTimViec365: getMaxUserID._idTV365,
                        idRaoNhanh365: getMaxUserID._idRN365,
                        idQLC: getMaxUserID._idQLC,
                        inForCompany: {
                            scan: 1,
                            usc_kd: kd.usc_kd,
                            usc_kd_first: kd.usc_kd,
                            description: description || null,
                            timviec365: {
                                usc_lv: lvID
                            }
                        }
                    };

                    if (linkVideo) {
                        data.usc_video = linkVideo;
                        data.usc_video_type = 2;
                    }

                    const company = new Users(data);
                    await company.save();

                    // Gửi mail kích hoạt
                    sendMail.SendRegisterNTDAPP(email, username, otp);

                    // Xử lý upload hình ảnh vào kho nếu có
                    if (JSON.stringify(req.files) !== '{}') {
                        // Cập nhật ảnh đại diện
                        const avatarUser = req.files.avatarUser;
                        const uploadLogo = service.uploadLogo(avatarUser);
                        await Users.updateOne({ _id: getMaxUserID._id }, {
                            $set: {
                                avatarUser: uploadLogo.file_name
                            }
                        });

                        // Xử lý hình ảnh vào kho
                        const storage = req.files.storage;
                        let uploadStorage, isUploadLogo = 0;
                        for (let index = 0; index < storage.length; index++) {
                            const file = storage[index];
                            if (service.checkItemStorage(file.type)) {
                                if (service.isImage(file.type)) {
                                    uploadStorage = service.uploadStorage(getMaxUserID._idTV365, file, 'image');
                                    await service.addStorage(getMaxUserID._idTV365, 'image', uploadStorage.file_name);
                                } else {
                                    uploadStorage = service.uploadStorage(getMaxUserID._idTV365, file, 'video');
                                    await service.addStorage(getMaxUserID._idTV365, 'video', uploadStorage.file_name);
                                }
                            }
                        }
                    }

                    // gửi cho bộ phận nhân sự qua appchat
                    // await functions.getDataAxios('http://43.239.223.142:9000/api/message/SendMessage_v2', dataSendChatApp)
                    let companyUnset = await functions.getDatafindOne(CompanyUnset, { email })
                    if (companyUnset != null) {
                        await functions.getDataDeleteOne(CompanyUnset, { email })
                    }

                    // Lưu lại thông tin phân quyền
                    const listPermissions = request.listPermissions;
                    servicePermissionNotify.HandlePermissionNotify(getMaxUserID._idTV365, listPermissions);

                    const token = await functions.createToken(data, "1d");
                    return functions.success(res, 'đăng ký thành công', {
                        access_token: token,
                        user_id: getMaxUserID._idTV365,
                        chat365_id: getMaxUserID._id
                    })
                } else {
                    return functions.setError(res, 'email đã tồn tại', 404)
                }
            } else {
                return functions.setError(res, 'email hoặc số điện thoại định dạng không hợp lệ', 404)
            }

        } else {
            return functions.setError(res, 'Thiếu dữ liệu', 404)
        }
    } catch (error) {
        console.log(error);
        return functions.setError(res, error)
    }
}

// hàm dăng nhập
exports.login = async(req, res, next) => {
    try {
        if (req.body.email && req.body.password) {
            const type = 1;
            const email = req.body.email
            const password = req.body.password

            let checkPhoneNumber = await functions.checkEmail(email);
            if (checkPhoneNumber) {
                let findUser = await functions.getDatafindOne(Users, { email, type: 1 })
                if (!findUser) {
                    return functions.setError(res, "không tìm thấy tài khoản trong bảng user", 404)
                }
                let checkPassword = await functions.verifyPassword(password, findUser.password)
                if (!checkPassword) {
                    return functions.setError(res, "Mật khẩu sai", 404)
                }
                if (findUser.type == type) {
                    const token = await functions.createToken({
                        _id: findUser._id,
                        idTimViec365: findUser.idTimViec365,
                        idQLC: findUser.idQLC,
                        idRaoNhanh365: findUser.idRaoNhanh365,
                        email: findUser.email,
                        phoneTK: findUser.phoneTK,
                        createdAt: findUser.createdAt,
                        type: 1
                    }, "1d");
                    const refreshToken = await functions.createToken({ userId: findUser._id }, "1d")
                    let data = {
                        access_token: token,
                        refresh_token: refreshToken,
                        chat365_id: findUser._id,
                        user_info: {
                            usc_id: findUser.idTimViec365,
                            usc_email: findUser.email,
                            usc_phone_tk: findUser.phoneTK,
                            usc_pass: findUser.password,
                            usc_company: findUser.userName,
                            usc_logo: findUser.avatarUser,
                            usc_phone: findUser.phone,
                            usc_city: findUser.city,
                            usc_qh: findUser.district,
                            usc_address: findUser.address,
                            usc_create_time: findUser.createdAt,
                            usc_update_time: findUser.updatedAt,
                            usc_active: findUser.lastActivedAt,
                            usc_authentic: findUser.authentic,
                            usc_lat: findUser.latitude,
                            usc_long: findUser.longtitude,
                            // usc_name: findUser.inForCompany.userContactName,
                            // usc_name_add: findUser.inForCompany.userContactAddress,
                            // usc_name_phone: findUser.inForCompany.userContactPhone,
                            // usc_name_email: findUser.inForCompany.userContactEmail,
                        }
                    }
                    if (findUser.inForCompany) {
                        data.user_info.usc_name = findUser.inForCompany.userContactName;
                        data.user_info.usc_name_add = findUser.inForCompany.userContactAddress;
                        data.user_info.usc_name_phone = findUser.inForCompany.userContactPhone;
                        data.user_info.usc_name_email = findUser.inForCompany.userContactEmail;
                    }
                    return functions.success(res, 'Đăng nhập thành công', data);
                } else return functions.setError(res, "tài khoản này không phải tài khoản công ty", 404);


            } else {
                return functions.setError(res, "không đúng định dạng email", 404)
            }
        }
    } catch (error) {
        return functions.setError(res, error, 404)
    }

};

// hàm lấy user khi đăng ký sai
exports.registerFall = async(req, res, next) => {
    try {
        let request = req.body,
            email = request.email,
            phone = request.phone,
            nameCompany = request.nameCompany,
            city = request.city,
            district = request.district,
            address = request.address,
            regis = request.regis;
        let maxID = await functions.getMaxID(CompanyUnset) || 1;
        if ((email) != undefined) {
            // check email ,phone
            let checkEmail = await functions.checkEmail(email)
            let CheckPhoneNumber = await functions.checkPhoneNumber(phone)
            if ((checkEmail && CheckPhoneNumber) == true) {
                let company = await functions.getDatafindOne(CompanyUnset, { email })
                if (company == null) {
                    const companyUnset = new CompanyUnset({
                        _id: (Number(maxID) + 1),
                        email: email,
                        nameCompany: nameCompany | null,
                        type: 1,
                        phone: phone,
                        city: city | null,
                        district: district | null,
                        address: address || null,
                        errTime: new Date().getTime(),
                        regis: regis || null

                    });
                    await companyUnset.save();
                    return functions.success(res, 'tạo thành công')

                } else {
                    await CompanyUnset.updateOne({ email: email }, {
                        $set: {
                            nameCompany: nameCompany,
                            phone: phone,
                            city: city,
                            district: district,
                            address: address,
                            errTime: new Date().getTime(),
                            regis: regis
                        }
                    });
                    return functions.success(res, 'update thành công')


                }
            } else {
                return functions.setError(res, 'email hoặc số điện thoại không đúng định dạng', 404)
            }
        } else {
            return functions.setError(res, 'thiếu dữ liệu gmail', 404)

        }
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm gửi otp qua gmail khi kích hoạt tài khoản
exports.sendOTP = async(req, res, next) => {
    try {
        let email = req.body.email;
        if (email != undefined) {
            let checkEmail = await functions.checkEmail(email);
            if (checkEmail) {
                let user = await functions.getDatafindOne(Users, { email, type: 1 })
                if (user) {
                    let otp = await functions.randomNumber
                    await Users.updateOne({ _id: user._id }, {
                        $set: {
                            otp: otp
                        }
                    });
                    await functions.sendEmailVerificationRequest(otp, email, user.userName);
                    return functions.success(res, 'Gửi mã OTP thành công');
                }
                return functions.setError(res, 'tài khoản không tồn tại', 404)
            } else {
                return functions.setError(res, 'email không đúng định dạng', 404)
            }
        } else {
            return functions.setError(res, 'thiếu dữ liệu gmail', 404)
        }

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm xác nhận otp để kích hoạt tài khoản
exports.verify = async(req, res, next) => {
    try {
        let otp = req.body.otp,
            user = req.user.data;
        if (otp) {
            let User = await Users.findOne({ _id: user._id, otp });
            if (User != null) {
                await Users.updateOne({ _id: User._id }, {
                    $set: {
                        authentic: 1
                    }
                });
                return functions.success(res, 'xác thực thành công', { user_id: User.idTimViec365 })
            }
            return functions.setError(res, 'xác thực thất bại', 404)
        }
        return functions.setError(res, 'thiếu dữ liệu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm bước 1 của quên mật khẩu
exports.forgotPasswordCheckMail = async(req, res, next) => {
    try {
        let email = req.body.email;
        let checkEmail = await functions.checkEmail(email);
        if (checkEmail) {
            let verify = await Users.findOne({ email: email, type: 1 });
            if (verify != null) {
                // api lẫy mã OTP qua app Chat
                let data = await functions.getDataAxios('http://43.239.223.142:9000/api/users/RegisterMailOtp', { email });
                let otp = data.data.otp
                if (otp) {
                    await Users.updateOne({ email: email }, {
                        $set: {
                            otp: otp
                        }
                    });
                    const token = await functions.createToken(verify, '30m')
                    return functions.success(res, 'xác thực thành công', { token })
                }
                return functions.setError(res, 'chưa lấy được mã otp', 404)

            }
            return functions.setError(res, 'email không đúng', 404)
        }
        return functions.setError(res, 'sai định dạng email', 404)


    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm bước 2 của quên mật khẩu
exports.forgotPasswordCheckOTP = async(req, res, next) => {
    try {
        let email = req.user.data.email;
        let otp = req.body.ma_xt;
        if (otp) {
            let verify = await Users.findOne({ email: email, otp: otp, type: 1 });
            if (verify != null) {
                return functions.success(res, 'xác thực thành công')
            }
            return functions.setError(res, 'mã otp không đúng', 404)
        }
        return functions.setError(res, 'thiếu mã otp', 404)


    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm bước 3 của quên mật khẩu
exports.updatePassword = async(req, res, next) => {
    try {
        let email = req.user.data.email,
            password = req.body.password;
        if (password) {
            await Users.updateOne({ email: email, type: 1 }, {
                $set: {
                    password: md5(password)
                }
            });
            return functions.success(res, 'đổi mật khẩu thành công')

        }
        return functions.setError(res, 'thiếu mật khẩu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm cập nhập thông tin công ty
exports.updateInfor = async(req, res, next) => {
    try {
        let companyID = req.user.data._id,
            request = req.body,
            phone = request.phone,
            userCompany = request.name,
            city = request.city,
            district = request.usc_qh,
            address = request.address,
            description = request.gt,
            mst = request.thue,
            tagLinhVuc = request.tagLinhVuc;

        if (phone && userCompany && city && district && address && description) {
            let checkPhone = await functions.checkPhoneNumber(phone)
            if (checkPhone) {
                await Users.updateOne({ _id: companyID }, {
                    $set: {
                        'inForCompany.description': description,
                        'userName': userCompany,
                        'phone': phone,
                        'city': city,
                        'district': district,
                        'address': address,
                        'inForCompany.mst': mst || null,
                        "inForCompany.tagLinhVuc": tagLinhVuc

                    }
                });
                return functions.success(res, 'update thành công')
            }
            return functions.setError(res, 'sai định dạng số điện thoại', 404)
        }
        return functions.setError(res, 'thiếu dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm cập nhập thông tin liên hệ 
exports.updateContactInfo = async(req, res, next) => {
    try {
        let email = req.user.data.email
        let userContactName = req.body.name_lh,
            userContactPhone = req.body.phone_lh,
            userContactAddress = req.body.address_lh,
            userContactEmail = req.body.email_lh;

        if (userContactAddress && userContactEmail && userContactName && userContactPhone) {
            let checkPhone = await functions.checkPhoneNumber(userContactPhone);
            let checkEmail = await functions.checkEmail(userContactEmail);

            if (checkEmail && checkPhone) {
                let user = await functions.getDatafindOne(Users, { email: email, type: 1 })

                if (user != null) {
                    await Users.updateOne({ email: email, type: 1 }, {
                        $set: {
                            'inForCompany.userContactName': userContactName,
                            'inForCompany.userContactPhone': userContactPhone,
                            'inForCompany.userContactAddress': userContactAddress,
                            'inForCompany.userContactEmail': userContactEmail,
                        }
                    });
                    return functions.success(res, 'update thành công')
                }
                return functions.setError(res, 'email không tồn tại')
            }
            return functions.setError(res, 'sai định dạng số điện thoại hoặc email')
        }
        return functions.setError(res, 'thiếu dữ liệu')
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm cập nhập video hoặc link 
exports.updateVideoOrLink = async(req, res, next) => {
    try {
        let email = req.user.data.email,
            videoType = req.file,
            linkVideo = req.body.linkVideo,
            video = '',
            link = '';
        if (videoType) {
            let checkVideo = await functions.checkVideo(videoType);
            if (checkVideo) {
                video = videoType.filename
            } else {
                await functions.deleteImg(videoType)
                return functions.setError(res, 'video không đúng định dạng hoặc lớn hơn 100MB ', 404)
            }

        }
        if (linkVideo) {
            let checkLink = await functions.checkLink(linkVideo);
            if (checkLink) {
                link = linkVideo;
            } else {
                return functions.setError(res, 'link không đúng định dạng ', 404)
            }
        }
        let user = await functions.getDatafindOne(Users, { email, type: 1 })
        if (user != null) {
            await Users.updateOne({ email: email, type: 1 }, {
                $set: {
                    'inForCompany.videoType': video,
                    'inForCompany.linkVideo': link
                }
            });
            return functions.success(res, 'update thành công')
        }
        await functions.deleteImg(videoType)
        return functions.setError(res, 'email không tồn tại')
    } catch (error) {
        console.log(error)
        await functions.deleteImg(req.file)
        return functions.setError(res, error)
    }
}

// hàm đổi mật khẩu bước 1
exports.changePasswordSendOTP = async(req, res, next) => {
    try {
        let email = req.user.data.email
        let id = req.user.data._id
        let otp = await functions.randomNumber;
        let data = {
            UserID: id,
            SenderID: 1191,
            MessageType: 'text',
            Message: `Chúng tôi nhận được yêu cầu tạo mật khẩu mới tài khoản ứng viên trên timviec365.vn. Mã OTP của bạn là: '${otp}'`
        }
        await functions.getDataAxios('http://43.239.223.142:9000/api/message/SendMessageIdChat', data)
        await Users.updateOne({ email: email, type: 1 }, {
            $set: {
                otp: otp
            }
        });
        return functions.success(res, 'update thành công')
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm bước 2  đổi mật khẩu
exports.changePasswordCheckOTP = async(req, res, next) => {
    try {
        let email = req.user.data.email
        let otp = req.body.otp
        if (otp) {
            let verify = await Users.findOne({ email, otp, type: 1 });
            console.log(email, otp);
            if (verify != null) {
                return functions.success(res, 'xác thực thành công')
            }
            return functions.setError(res, 'mã otp không đúng', 404)
        }
        return functions.setError(res, 'thiếu otp', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm đổi mật khẩu bước 3
exports.changePassword = async(req, res, next) => {
    try {
        let email = req.user.data.email
        let password = req.body.password
        if (password) {
            await Users.updateOne({ email: email, type: 1 }, {
                $set: {
                    password: md5(password),
                }
            });
            return functions.success(res, 'đổi mật khẩu thành công')
        }
        return functions.setError(res, 'thiếu mật khẩu', 404)


    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm cập nhập avatar
exports.updateImg = async(req, res, next) => {
    try {
        let email = req.user.data.email,
            avatarUser = req.file;
        if (avatarUser) {
            let checkImg = await functions.checkImage(avatarUser.path)
            if (checkImg) {
                await Users.updateOne({ email: email, type: 1 }, {
                    $set: {
                        avatarUser: avatarUser.filename,
                    }
                });
                return functions.success(res, 'thay đổi ảnh thành công')
            } else {
                await functions.deleteImg(avatarUser)
                return functions.setError(res, 'sai định dạng ảnh hoặc ảnh lớn hơn 2MB', 404)
            }
        } else {
            await functions.deleteImg(avatarUser)
            return functions.setError(res, 'chưa có ảnh', 404)
        }
    } catch (error) {
        console.log(error)
        await functions.deleteImg(req.file)
        return functions.setError(res, error)
    }
}

// hàm lấy dữ liệu thông tin cập nhập
exports.getDataCompany = async(req, res, next) => {
    try {
        let id = req.user.data.idTimViec365;
        let user = await functions.getDatafindOne(Users, { idTimViec365: id, type: 1 });
        if (user) {
            return functions.success(res, 'lấy thông tin thành công', user)
        }
        return functions.setError(res, 'người dùng không tồn tại', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm lấy dữ liệu danh sách ứng tuyển UV
exports.listUVApplyJob = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 10;

        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let findUV = await functions.pageFind(ApplyForJob, { userID: idCompany, type: 1 }, { _id: -1 }, skip, limit);
        const total = await functions.findCount(ApplyForJob, { userID: idCompany, type: 1 });

        return functions.success(res, "Lấy danh sách uv thành công", { listUv: findUV, total });
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }

}

// hàm lấy dữ liệu danh sách ứng tuyển của chuyên viên gửi
exports.listUVApplyJobStaff = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let page = Number(req.body.start);
        let pageSize = Number(req.body.curent);
        if (page && pageSize) {
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            let findUV = await functions.pageFind(ApplyForJob, { userID: idCompany, type: 2 }, { _id: -1 }, skip, limit);
            const totalCount = await functions.findCount(ApplyForJob, { userID: idCompany, type: 2 });
            const totalPages = Math.ceil(totalCount / pageSize);
            if (findUV) {
                return functions.success(res, "Lấy danh sách uv thành công", { totalCount, totalPages, listUv: findUV });
            }
            return functions.setError(res, 'không lấy được danh sách', 404)
        } else {
            let findUV = await functions.getDatafind(ApplyForJob, { userID: idCompany, type: 2 });
            return functions.success(res, "Lấy danh sách uv thành công", findUV);
        }
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }

}

// hàm thống kê tin đăng
exports.postStatistics = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        const now = new Date();
        let startOfDay = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
        let endOfDay = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
        let threeDaysTomorow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
        // count UV ứng tuyển
        let countApplyForJobTypeOne = await functions.findCount(ApplyForJob, { userID: idCompany, type: 1 });
        // count cọng tác viên gửi Uv
        let countApplyForJobTypeTwo = await functions.findCount(ApplyForJob, { userID: idCompany, type: 2 });
        // count việc còn hạn
        let countAvailableJobs = await functions.findCount(NewTV365, { userID: idCompany, hanNop: { $gt: now } });
        // count việc hết hạn
        let countGetExpiredJobs = await functions.findCount(NewTV365, { userID: idCompany, hanNop: { $lt: now } });
        // count tin đã đăng trong ngày
        let countPostsInDay = await functions.findCount(NewTV365, { userID: idCompany, createTime: { $gte: startOfDay, $lte: endOfDay } });
        // count tin đã cập nhập trong ngày
        let countRefreshPostInDay = await functions.findCount(NewTV365, { userID: idCompany, updateTime: { $gte: startOfDay, $lte: endOfDay } });
        // count tin gần hết hạn 
        let countJobsNearExpiration = await functions.findCount(NewTV365, { userID: idCompany, hanNop: { $lte: threeDaysTomorow, $gte: now } });
        let count = {
            count_uv_ung_tuyen: countApplyForJobTypeOne,
            count_ctv_gui_uv: countApplyForJobTypeTwo,
            count_tin_dang_con_han: countAvailableJobs,
            count_tin_dang_het_han: countGetExpiredJobs,
            count_tin_dang_trong_ngay: countPostsInDay,
            count_tin_cap_nhap_trong_ngay: countRefreshPostInDay,
            count_tin_sap_het_han: countJobsNearExpiration,
        }
        return functions.success(res, "lấy số lượng thành công", count)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm lấy danh sách các ứng viên đã lưu
exports.listSaveUV = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let page = Number(req.body.start);
        let pageSize = Number(req.body.curent);
        if (page && pageSize) {
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            let findUV = await functions.pageFind(SaveCandidate, { uscID: idCompany }, { _id: -1 }, skip, limit);
            const totalCount = await functions.findCount(SaveCandidate, { uscID: idCompany });
            const totalPages = Math.ceil(totalCount / pageSize);
            if (findUV) {
                return functions.success(res, "Lấy danh sách uv thành công", { totalCount, totalPages, listUv: findUV });
            }
            return functions.setError(res, 'không lấy được danh sách', 404)
        } else {
            let findUV = await functions.getDatafind(SaveCandidate, { uscID: idCompany });
            return functions.success(res, "Lấy danh sách tất cả uv thành công", findUV);
        }
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm quản lý điểm
exports.manageFilterPoint = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let point = await functions.getDatafindOne(PointCompany, { uscID: idCompany, type: 1 });
        let now = new Date();
        let pointUSC = 0;
        // console.log(point);
        // let checkReset0 = await functions.getDatafindOne(PointCompany, { uscID: idCompany, type: 1, dayResetPoint0: { $lt: now } });
        // if (checkReset0 == null) {
        //     pointUSC = point.pointCompany
        // }
        return functions.success(res, "lấy số lượng thành công", {
            pointFree: 0,
            pointUSC: pointUSC,
            totalPoint: pointUSC,
        })
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm xem ứng hồ sơ ứng viên với điểm lọc 
exports.seenUVWithPoint = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let idUser = req.body.useID;
        let noteUV = req.body.noteUV;
        let ipUser = req.body.ipUser;
        let returnPoint = req.body.returnPoint;
        let point = 0;
        if (idUser) {
            // Kiểm tra xem đã mất điểm hay chưa
            const checkUsePoint = await functions.getDatafindOne(PointUsed, {
                uscID: idCompany,
                useID: idUser
            });
            if (!checkUsePoint) {
                let companyPoint = await functions.getDatafindOne(PointCompany, { uscID: idCompany });
                if (companyPoint) {
                    let pointUSC = companyPoint.pointCompany;
                    if (pointUSC > 0) {
                        await PointCompany.updateOne({ uscID: idCompany }, {
                            $set: {
                                pointUSC: pointUSC - 1,
                            }
                        });
                        let maxID = await functions.getMaxID(PointUsed) || 0;
                        const pointUsed = new PointUsed({
                            _id: Number(maxID) + 1,
                            uscID: idCompany,
                            useID: idUser,
                            point: 1,
                            type: 1,
                            noteUV: noteUV || " ",
                            usedDay: new Date().getTime(),
                            returnPoint: returnPoint || 0,
                            ipUser: ipUser
                        })
                        await pointUsed.save();
                        return functions.success(res, "Xem thành công")
                    }
                    return functions.success(res, "Điểm còn lại là 0", {
                        point: 0
                    })
                }
                return functions.setError(res, 'nhà tuyển dụng không có điểm', 404);
            } else {
                return functions.setError(res, 'Ứng viên này đã được xem thông tin', 200);
            }
        }
        return functions.setError(res, 'không có dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm đánh giá của NTD về CTV
exports.submitFeedbackCtv = async(req, res, next) => {
    try {
        let request = req.body,
            idCompany = req.user.data.idTimViec365,
            description = req.user.data.inForCompany.description;
        if (request) {
            let company = await functions.getDatafindOne(UserCompanyMultit, { uscID: idCompany });
            if (company) {
                await UserCompanyMultit.updateOne({ uscID: idCompany }, {
                    $set: {
                        dgc: request,
                        dgTime: new Date().getTime(),
                    }
                });
                return functions.success(res, "Cập nhập thành công")
            } else {
                let maxID = await functions.getMaxID(UserCompanyMultit) || 0;
                const feedBack = new UserCompanyMultit({
                    _id: maxID,
                    uscID: idCompany,
                    companyInfo: description,
                    dgc: request,
                    dgTime: new Date().getTime(),
                });
                await feedBack.save();
                return functions.success(res, "tạo thành công")
            }
        }
        return functions.setError(res, 'không có dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm đánh giá của NTD về Web
exports.submitFeedbackWeb = async(req, res, next) => {
    try {
        let request = req.body,
            idCompany = req.user.data.idTimViec365,
            description = req.user.data.inForCompany.description;
        if (request) {
            let company = await functions.getDatafindOne(UserCompanyMultit, { uscID: idCompany });
            if (company) {
                await UserCompanyMultit.updateOne({ uscID: idCompany }, {
                    $set: {
                        dgtv: request,
                        dgTime: new Date().getTime(),
                    }
                });
                return functions.success(res, "Cập nhập thành công")
            } else {
                let maxID = await functions.getMaxID(UserCompanyMultit) || 0;
                const feedBack = new UserCompanyMultit({
                    _id: maxID,
                    uscID: idCompany,
                    companyInfo: description,
                    dgtv: request,
                    dgTime: new Date().getTime(),
                });
                await feedBack.save();
                return functions.success(res, "tạo thành công")

            }
        }
        return functions.setError(res, 'không có dữ liệu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm lấy ra kho ảnh
exports.displayImages = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let khoAnh = await functions.getDatafindOne(Users, { idTimViec365: idCompany, type: 1 });
        if (khoAnh) {
            let data = {
                listImgs: khoAnh.inForCompany.comImages,
                listVideos: khoAnh.inForCompany.comVideos,
            }
            return functions.success(res, "lấy dữ liệu thành công thành công", data)
        }
        return functions.setError(res, 'không có dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm up ảnh ở kho ảnh
exports.uploadImg = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let img = req.files;
        let imageMoment = 0;
        let sizeImg = 0;
        let user = await functions.getDatafindOne(Users, { idTimViec365: idCompany, type: 1 });
        if (user) {
            let listImg = user.inForCompany.comImages;
            let listVideo = user.inForCompany.comVideos;
            const listMedia = [...listImg, ...listVideo];
            for (let i = 0; i < listMedia.length; i++) {
                imageMoment += listMedia[i].size;
            }
            if (imageMoment < functions.MAX_Kho_Anh) {
                if (img) {
                    for (let i = 0; i < img.length; i++) {
                        sizeImg += img[i].size;
                    }
                    if ((Number(sizeImg) + Number(imageMoment)) <= functions.MAX_Kho_Anh) {
                        for (let i = 0; i < img.length; i++) {
                            let checkImg = await functions.checkImage(img[i].path);
                            if (checkImg) {
                                let id = listImg[listImg.length - 1] || 0;
                                let newID = id._id || 0;
                                listImg.push({
                                    _id: Number(newID) + 1,
                                    name: img[i].filename,
                                    size: img[i].size
                                })
                            } else {
                                if (img) {
                                    for (let i = 0; i < img.length; i++) {
                                        await functions.deleteImg(img[i])
                                    }
                                }
                                return functions.setError(res, 'sai định dạng ảnh hoặc ảnh lớn hơn 2MB', 404)
                            }
                        }
                        await Users.updateOne({ idTimViec365: idCompany, type: 1 }, {
                            $set: { 'inForCompany.comImages': listImg }
                        });
                        return functions.success(res, 'thêm ảnh thành công')

                    } else {
                        if (img) {
                            for (let i = 0; i < img.length; i++) {
                                await functions.deleteImg(img[i])
                            }
                        }
                        return functions.setError(res, 'ảnh thêm vào đã quá dung lượng của kho', 404)
                    }
                } else {
                    if (img) {
                        for (let i = 0; i < img.length; i++) {
                            await functions.deleteImg(img[i])
                        }
                    }
                    return functions.setError(res, 'chưa có ảnh', 404)
                }
            }
            if (img) {
                for (let i = 0; i < img.length; i++) {
                    await functions.deleteImg(img[i])
                }
            }
            return functions.setError(res, ' kho ảnh đã đầy', 404)
        }
        if (img) {
            for (let i = 0; i < img.length; i++) {
                await functions.deleteImg(img[i])
            }
        }
        return functions.setError(res, 'nguời dùng không tồn tại', 404)
    } catch (error) {
        console.log(error)
        if (img) {
            for (let i = 0; i < img.length; i++) {
                await functions.deleteImg(img[i])
            }
        }
        return functions.setError(res, error)
    }
}

// hàm up video ở kho ảnh
exports.uploadVideo = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let video = req.files;
        let imageMoment = 0;
        let sizeVideo = 0;
        let user = await functions.getDatafindOne(Users, { idTimViec365: idCompany, type: 1 });
        if (user) {
            let listImg = user.inForCompany.comImages;
            let listVideo = user.inForCompany.comVideos;
            const listMedia = [...listImg, ...listVideo];
            console.log(listMedia)
            for (let i = 0; i < listMedia.length; i++) {
                imageMoment += listMedia[i].size;
            }

            if (imageMoment < functions.MAX_Kho_Anh) {
                if (video) {
                    for (let i = 0; i < video.length; i++) {
                        sizeVideo += video[i].size;
                    }
                    if ((Number(sizeVideo) + Number(imageMoment)) <= functions.MAX_Kho_Anh) {
                        for (let i = 0; i < video.length; i++) {
                            let checkImg = await functions.checkVideo(video[i]);
                            if (checkImg) {
                                let id = listVideo[listVideo.length - 1] || 0;
                                let newID = id._id || 0;
                                listVideo.push({
                                    _id: Number(newID) + 1,
                                    name: video[i].filename,
                                    size: video[i].size,
                                })

                            } else {
                                if (video) {
                                    for (let i = 0; i < video.length; i++) {
                                        await functions.deleteImg(video[i])
                                    }
                                }
                                return functions.setError(res, 'sai định dạng video hoặc video lớn hơn 100MB', 404)
                            }
                        }
                        await Users.updateOne({ idTimViec365: idCompany, type: 1 }, {
                            $set: { 'inForCompany.comVideos': listVideo }
                        });
                        return functions.success(res, 'thêm video thành công')
                    } else {
                        if (video) {
                            for (let i = 0; i < video.length; i++) {
                                await functions.deleteImg(video[i])
                            }
                        }
                        return functions.setError(res, 'video thêm vào đã quá dung lượng của kho', 404)
                    }
                } else {
                    if (video) {
                        for (let i = 0; i < video.length; i++) {
                            await functions.deleteImg(video[i])
                        }
                    }
                    return functions.setError(res, 'chưa có video', 404)
                }
            }
            if (video) {
                for (let i = 0; i < video.length; i++) {
                    await functions.deleteImg(video[i])
                }
            }
            return functions.setError(res, 'kho ảnh đã đầy', 404)
        }
        if (video) {
            for (let i = 0; i < video.length; i++) {
                await functions.deleteImg(video[i])
            }
        }
        return functions.setError(res, 'nguời dùng không tồn tại', 404)
    } catch (error) {
        console.log(error)
        if (video) {
            for (let i = 0; i < video.length; i++) {
                await functions.deleteImg(video[i])
            }
        }
        return functions.setError(res, error)
    }
}

// hàm xóa ảnh
exports.deleteImg = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let idFile = req.body.idFile;
        let user = await functions.getDatafindOne(Users, { idTimViec365: idCompany, type: 1 });
        if (idFile && user) {
            let listImg = user.inForCompany.comImages;
            const index = listImg.findIndex(img => img._id == idFile);
            if (index != -1) {
                let nameFile = listImg[index].name;
                await listImg.splice(index, 1);
                await Users.updateOne({ idTimViec365: idCompany, type: 1 }, {
                    $set: { 'inForCompany.comImages': listImg }
                });
                await functions.deleteImg(`public\\KhoAnh\\${idCompany}\\${nameFile}`)
                return functions.success(res, 'xoá thành công')
            } else {
                return functions.setError(res, 'id không đúng', 404)
            }

        }
        return functions.setError(res, 'tên file không tồn tại hoặc người dùng không tồn tại', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm xóa video
exports.deleteVideo = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let idFile = req.body.idFile;
        let user = await functions.getDatafindOne(Users, { idTimViec365: idCompany, type: 1 });
        if (idFile && user) {
            let listVideo = user.inForCompany.comVideos;
            const index = listVideo.findIndex(video => video._id == idFile);
            if (index != -1) {
                await listVideo.splice(index, 1);
                let nameFile = listVideo[index].name;
                await Users.updateOne({ idTimViec365: idCompany, type: 1 }, {
                    $set: { 'inForCompany.comVideos': listVideo }
                });
                await functions.deleteImg(`public\\KhoAnh\\${idCompany}\\${nameFile}`)
                return functions.success(res, 'xoá thành công')
            } else {
                return functions.setError(res, 'id không đúng', 404)
            }
        }
        return functions.setError(res, 'tên file không tồn tại hoặc người dùng không tồn tại', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm gọi data lĩnh vực
exports.getDataLV = async(req, res, next) => {
    try {
        let lists = await CategoryCompany.find({ nameTag: { $ne: "" }, cityTag: 0 }, { _id: 1, nameTag: 1 }),
            data = [];
        for (let index = 0; index < lists.length; index++) {
            const element = lists[index];
            data.push({
                "id": element._id,
                "name_tag": element.nameTag
            });
        }
        return functions.success(res, 'lấy thành công', { data })
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
};

// hàm tìm lĩnh vực theo ngành nghề
exports.getFieldsByIndustry = async(req, res, next) => {
    try {
        let catID = req.body.cat_id;
        if (catID) {
            let data = await functions.getDatafind(CategoryCompany, { tagIndex: catID })
            return functions.success(res, 'lấy thành công', { data })
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// lưu ứng viên 
exports.luuUV = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let idUser = req.body.user_id;
        let type = req.body.type;
        if (idUser) {
            // Kiểm tra đã lưu hay chưa
            const candidate = await functions.getDatafindOne(users, {
                idTimViec365: idUser,
                type: 0
            });
            if (candidate != undefined) {
                const checkSaveCandi = await functions.getDatafindOne(SaveCandidate, {
                    uscID: idCompany,
                    userID: idUser,
                });
                if (checkSaveCandi == undefined) {
                    let maxID = await functions.getMaxID(SaveCandidate) || 0;
                    let newID = maxID._id || 0;
                    const uv = new SaveCandidate({
                        _id: Number(newID) + 1,
                        uscID: idCompany,
                        userID: idUser,
                        saveTime: new Date().getTime()
                    })
                    await uv.save();
                    return functions.success(res, 'lưu thành công')
                } else {
                    let deleteUv = await functions.getDataDeleteOne(SaveCandidate, {
                        uscID: idCompany,
                        userID: idUser,
                    })
                    if (deleteUv) {
                        return functions.success(res, 'bỏ lưu thành công')
                    }
                }
            }
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// xóa ứng viên trong danh sách lưu
exports.deleteUV = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let idUser = req.body.user_id;
        if (idUser) {
            await functions.getDataDeleteOne(SaveCandidate, { uscID: idCompany, userID: idUser })
            return functions.success(res, 'xóa thành công', )
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// danh sách sử dụng điểm của nhà tuyển dụng cho Uv
exports.listUVPoin = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let page = Number(req.body.start);
        let pageSize = Number(req.body.curent);
        if (page && pageSize) {
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            let findUV = await functions.pageFind(PointUsed, { uscID: idCompany }, { _id: -1 }, skip, limit);
            const totalCount = await functions.findCount(PointUsed, { uscID: idCompany });
            const totalPages = Math.ceil(totalCount / pageSize);
            if (findUV) {
                return functions.success(res, "Lấy danh sách uv thành công", { total: totalCount, items: findUV });
            }
            return functions.setError(res, 'không lấy được danh sách', 404)
        } else {
            let findUV = await functions.getDatafind(SaveCandidate, { uscID: idCompany });
            return functions.success(res, "Lấy danh sách tất cả uv thành công", findUV);
        }
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// xóa uv trong danh sách dùng điểm
exports.deleteUVUsePoin = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let idUser = req.body.user_id;
        if (idUser) {
            await functions.getDataDeleteOne(PointUsed, { uscID: idCompany, userID: idUser })
            return functions.success(res, 'xóa thành công', )
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm cập nhập ứng viên ứng tuyển 
exports.updateUvApplyJob = async(req, res, next) => {
    try {
        let newID = req.body.new_id;
        let userID = req.body.user_id;
        let type = req.body.type;
        if (newID && userID && type) {
            let news = await functions.getDatafindOne(NewTV365, { _id: newID });
            let user = await functions.getDatafindOne(Users, { idTimViec365: userID, type: 1 });
            if (news && user) {
                await ApplyForJob.updateOne({ userID: userID, newID: newID }, {
                    $set: { kq: type }
                });
                return functions.success(res, 'cập nhập thành công', )
            }
            return functions.setError(res, 'người dùng hoặc bài viết không tồn tại', 404)
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm cập nhập ứng viên qua điểm lọc
exports.updateUvWithPoint = async(req, res, next) => {
    try {
        let userID = req.body.user_id;
        let type = req.body.type;
        let note = req.body.note;
        if (userID) {
            let poin = await functions.getDatafindOne(PointUsed, { uscID: idCompany, useID: idUV });
            if (poin) {
                await PointUsed.updateOne({ uscID: idCompany, useID: idUV }, {
                    $set: {
                        type: type,
                        noteUV: note,
                    }
                });
                return functions.success(res, 'cập nhập thành công', )
            }
            return functions.setError(res, 'không tồn tại người dùng trong danh sách điểm lọc', 404)
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm chi tiết công ty trước đăng nhập
exports.getDetailInfoCompany = async(req, res, next) => {
    try {
        let idCompany = Number(req.body.user_id);
        if (idCompany) {
            let getData = await Users.aggregate([{
                $match: {
                    idTimViec365: idCompany,
                    type: 1
                }
            }, {
                $project: {
                    "usc_id": "$idTimViec365",
                    "usc_email": "$email",
                    "usc_company": "$userName",
                    "usc_alias": "$alias",
                    "usc_pass": "$password",
                    "chat365_id": "$_id",
                    "chat365_secret": "$chat365_secret",
                    "usc_name": "$inForCompany.timviec365.usc_name",
                    "usc_name_add": "$inForCompany.timviec365.usc_name_add",
                    "usc_name_phone": "$inForCompany.timviec365.usc_name_phone",
                    "usc_name_email": "$inForCompany.timviec365.usc_name_email",
                    "usc_redirect": "$inForCompany.timviec365.usc_redirect",
                    "usc_type": "$inForCompany.timviec365.usc_type",
                    "usc_mst": "$inForCompany.timviec365.usc_mst",
                    "usc_address": "$address",
                    "usc_phone": "$phone",
                    "usc_logo": "$inForCompany.timviec365.usc_logo" || null,
                    "usc_size": "$inForCompany.timviec365.usc_size",
                    "usc_website": "$inForCompany.timviec365.usc_website",
                    "usc_city": "$inForCompany.timviec365.usc_city",
                    "usc_create_time": "$createdAt",
                    "usc_update_time": "$updatedAt",
                    "usc_view_count": "$inForCompany.timviec365.usc_view_count",
                    "usc_authentic": "$authentic",
                    "usc_company_info": "$inForCompany.description",
                    "usc_lv": "$inForCompany.timviec365.usc_lv",
                    "usc_badge": "$inForCompany.timviec365.usc_badge",
                    "usc_video": "$inForCompany.timviec365.usc_video_type",
                    "usc_video_type": "$inForCompany.timviec365.usc_video_type",
                    "usc_xac_thuc": "$otp",
                    "usc_kd": "$inForCompany.usc_kd",
                    "idQLC": "$idQLC",
                }
            }]);
            if (getData.length > 0) {
                const company = getData[0];

                // Lấy danh sách tin tuyển dụng của cty
                const listNew = await functions.getDatafind(NewTV365, {
                        $or: [
                            { new_user_id: company.usc_id },
                            { new_user_redirect: company.usc_id }
                        ],
                        new_active: 1,
                        new_301: '',
                        new_md5: { $ne: 1 },
                    }),
                    // Số lượng tin tuyển dụng
                    count = await functions.findCount(NewTV365, {
                        $or: [
                            { new_user_id: company.usc_id },
                            { new_user_redirect: company.usc_id }
                        ],
                        new_active: 1,
                        new_301: '',
                        new_md5: { $ne: 1 },
                    }),
                    // Lấy từ khóa liên quan
                    tagBlog = await TagBlog.find({
                        $text: { $search: company.usc_company }
                    })
                    .limit(20)
                    .lean(),
                    // Lấy kho ảnh
                    storageImage = await CompanyStorage.find({
                        usc_id: idCompany,
                        image: { $ne: null }
                    }).lean(),
                    // Lấy kho video
                    storageVideo = await CompanyStorage.find({
                        usc_id: idCompany,
                        video: { $ne: null }
                    }).lean();

                for (let i = 0; i < storageImage.length; i++) {
                    const element = storageImage[i];
                    element.url = service.urlStorageImage(company.usc_create_time, element.image);
                }

                for (let j = 0; j < storageVideo.length; j++) {
                    const element = storageVideo[j];
                    element.url = service.urlStorageImage(company.usc_create_time, element.video);
                }

                company.storageImage = storageImage;
                company.storageVideo = storageVideo;

                return functions.success(res, 'Lấy thông tin công ty thành công', {
                    detail_company: company,
                    items: listNew,
                    tu_khoa: tagBlog
                })
            }
            return functions.setError(res, 'công ty không tồn tại', 404)
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm box mẫu cv
exports.formCV = async(req, res, next) => {
    try {
        let formCV = await CV.find().sort({ vip: -1, _id: -1 }).limit(10);
        return functions.success(res, 'lấy thành công', { formCV })

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// hàm đánh giá ứng viên 
exports.assessmentUV = async(req, res, next) => {
    try {
        let idUV = req.body.user_id;
        let idCompany = req.user.data.idTimViec365;
        let type = req.body.type;
        let note = req.body.note;
        if (idCompany) {
            let poin = await functions.getDatafindOne(PointUsed, { uscID: idCompany, useID: idUV });
            if (poin) {
                await PointUsed.updateOne({ uscID: idCompany, useID: idUV }, {
                    $set: {
                        type: type,
                        noteUV: note,
                    }
                });
                return functions.success(res, 'cập nhập thành công', )
            }
            return functions.setError(res, 'chưa xem chi tiết ứng viên', 404)
        }
        return functions.setError(res, 'không đủ dữ liệu', 404)

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

// Lấy danh sách tin tuyển dụng đã đăng
exports.listNews = async(req, res, next) => {
    try {
        let idCompany = req.user.data.idTimViec365;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 20;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        const condition = { new_user_id: idCompany, new_md5: "" };
        const listPost = await NewTV365.find(condition)
            .select("new_id new_title new_alias new_update_time new_city new_cat_id new_view_count new_bao_luu new_han_nop new_hot new_gap new_cao new_nganh new_create_time time_bao_luu")
            .limit(limit)
            .skip(skip)
            .sort({ new_id: -1 })
            .lean();

        for (let i = 0; i < listPost.length; i++) {
            const element = listPost[i];
            const cate = element.new_cat_id[0];
            const city = element.new_city[0];
            element.new_cat_id = element.new_cat_id.toString();
            element.new_city = element.new_city.toString();

            element.applied = await functions.findCount(ApplyForJob, { nhs_new_id: element.new_id, nhs_kq: 0 });
            element.count_uv = await functions.findCount(Users, {
                // "inForPerson.candidate.cv_cate_id": { $all: [cate] },
                "inForPerson.candidate.cv_city_id": { $all: [city] },
            });
        }

        const total = await functions.findCount(NewTV365, condition);
        return functions.success(res, "Lấy danh sách tin đăng thành công", { total, items: listPost });

    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}