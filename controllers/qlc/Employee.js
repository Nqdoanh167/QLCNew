const { isNull } = require('util');
const Users = require('../../models/Users')
const fnc = require('../../services/qlc/functions')
const md5 = require('md5');
const functions = require("../../services/functions")

const Deparment = require("../../models/qlc/Deparment")

//đăng kí tài khoản nhân viên 
exports.register = async(req, res) => {
    try {
        const { userName, emailContact, phoneTK, password, com_id, address, position_id, dep_id, phone, avatarUser, role, group_id, birthday, gender, married, experience, startWorkingTime, education, otp, team_id } = req.body;
        const createdAt = new Date()

        if ((userName && password && com_id && address && phoneTK) !== undefined) {
            let checkPhone = await functions.checkPhoneNumber(phoneTK);
            if (checkPhone) {
                let user = await Users.findOne({ phoneTK: phoneTK, type: 2 }).lean()
                let MaxId = await functions.getMaxUserID("user")

                if (user == null) {
                    const user = new Users({
                        _id: MaxId._id,
                        emailContact: emailContact,
                        phoneTK: phoneTK,
                        userName: userName,
                        phone: phone || phoneTK,
                        avatarUser: avatarUser,
                        type: 2,
                        password: md5(password),
                        address: address,
                        otp: otp,
                        createdAt: Date.parse(createdAt),
                        authentic: 0,
                        fromWeb: "quanlichung",
                        role: 0,
                        avatarUser: null,
                        idQLC: MaxId._idQLC,
                        idTimViec365: MaxId._idTV365,
                        idRaoNhanh365: MaxId._idRN365,
                        "inForPerson.employee.position_id": position_id,
                        "inForPerson.employee.com_id": com_id,
                        "inForPerson.employee.dep_id": dep_id,
                        "inForPerson.employee.group_id": group_id,
                        "inForPerson.employee.team_id": team_id,
                        "inForPerson.account.birthday": birthday,
                        "inForPerson.account.gender": gender,
                        "inForPerson.account.married": married,
                        "inForPerson.account.experience": experience,
                        "inForPerson.employee.startWorkingTime": startWorkingTime,
                        "inForPerson.account.education": education,
                    })


                    await user.save()
                    const token = await functions.createToken(user, "1d")
                    const refreshToken = await functions.createToken({ userId: user._id }, "1y")
                    let data = {
                        access_token: token,
                        refresh_token: refreshToken,
                    }
                    functions.success(res, "tạo tài khoản thành công", { user, data })
                } else {
                    return functions.setError(res, 'SDT đã tồn tại', 404);

                }
            } else {
                return functions.setError(res, ' định dạng sdt không đúng', 404);
            }

        } else {
            return functions.setError(res, 'Một trong các trường yêu cầu bị thiếu', 404)
        }
    } catch (e) {
        return functions.setError(res, e.message)

    }

}

// hàm gửi otp qua gmail khi kích hoạt tài khoản
exports.verify = async(req, res) => {
    try {
        let otp = req.body.ma_xt || null
        let phoneTK = req.user.data.phoneTK;
        let data = []
        if (otp) {
            let findUser = await Users.findOne({ phoneTK: phoneTK, type: 2 })
            if (findUser) {
                data = await Users.updateOne({ phoneTK: phoneTK, type: 2 }, {
                    $set: {
                        otp: otp
                    }
                })
                return functions.success(res, "lưu OTP thành công", { data, otp })
            } else {
                return functions.setError(res, "tài khoản không tồn tại")
            }


        } else if (!otp) {
            let verify = await Users.findOne({ phoneTK: phoneTK, type: 2 });
            if (verify != null) {
                await Users.updateOne({ phoneTK: phoneTK, type: 2 }, {
                    $set: {
                        authentic: 1
                    }
                });
                return functions.success(res, "xác thực thành công");
            } else {
                return functions.setError(res, "xác thực thất bại", 404);
            }


        } else {
            return functions.setError(res, "thiếu dữ liệu sdt", 404)
        }
    } catch (e) {
        return functions.setError(res, e.message)
    }
}
exports.verifyCheckOTP = async(req, res) => {
    try {
        let otp = req.body.ma_xt || null
        let phoneTK = req.user.data.phoneTK;

        if (otp) {
            let findUser = await Users.findOne({ phoneTK: phoneTK, type: 2 }).select("otp")
            if (findUser) {
                let data = findUser.otp
                if (data === otp) {
                    functions.success(res, "xác thực thành công")
                } else {
                    functions.setError(res, "xác thực thất bại")

                }
            } else {
                return functions.setError(res, "tài khoản không tồn tại")
            }
        } else {
            return functions.setError(res, "vui lòng nhập mã xác thực")

        }
    } catch (e) {
        return functions.setError(res, e.message)

    }
}


//hàm đăng nhập
exports.login = async(req, res, next) => {
    try {
        let phoneTK = req.body.phoneTK
        let email = req.body.email
        password = req.body.password
        type_user = {};
        if (phoneTK && password) {

            let checkPhone = await functions.checkPhoneNumber(phoneTK)
            if (checkPhone) {
                let checkTypeUser = await Users.findOne({ phoneTK: phoneTK }).lean()
                    // console.log(checkTypeUser)
                if (checkTypeUser.type == 0) {
                    type_user = 0
                    functions.success(res, "tài khoản là tài khoản cá nhân", { type_user })
                } else if (checkTypeUser.type == 1) {
                    type_user = 1
                    functions.success(res, "tài khoản là tài khoản cty", { type_user })

                } else if (checkTypeUser.type == 2) {
                    type_user = 2
                    let checkPassword = await functions.verifyPassword(password, checkTypeUser.password)
                    if (!checkPassword) {
                        return functions.setError(res, "Mật khẩu sai", 404)
                    }
                    if (checkTypeUser != null) {
                        const token = await functions.createToken(checkTypeUser, "1d")
                        const refreshToken = await functions.createToken({ userId: checkTypeUser._id }, "1y")
                        let data = {
                            access_token: token,
                            refresh_token: refreshToken,
                            com_info: {
                                com_id: checkTypeUser._id,
                                com_phone_tk: checkTypeUser.phoneTK,
                            }
                        }
                        data.type_user = type_user
                        return functions.success(res, 'Đăng nhập thành công bằng SDT', { data })

                    } else {
                        return functions.setError(res, "sai tai khoan hoac mat khau")
                    }
                } else {
                    functions.setError(res, "không tìm thấy tài khoản ")
                }

            } else {
                return functions.setError(res, "không đúng định dạng SDT", 404)
            }
        } else if (email && password) {
            let checkMail = await functions.checkEmail(email)
            if (checkMail) {
                let checkTypeUser = await Users.findOne({ email: email }).lean()
                    // console.log(checkTypeUser)
                if (checkTypeUser.type == 0) {
                    type_user = 0
                    functions.success(res, "tài khoản là tài khoản cá nhân", { type_user })
                } else if (checkTypeUser.type == 1) {
                    type_user = 1
                    functions.success(res, "tài khoản là tài khoản cty", { type_user })

                } else if (checkTypeUser.type == 2) {
                    type_user = 2
                    let checkPassword = await functions.verifyPassword(password, checkTypeUser.password)
                    if (!checkPassword) {
                        return functions.setError(res, "Mật khẩu sai", 404)
                    }
                    if (checkTypeUser != null) {
                        const token = await functions.createToken(checkTypeUser, "1d")
                        const refreshToken = await functions.createToken({ userId: checkTypeUser._id }, "1y")
                        let data = {
                            access_token: token,
                            refresh_token: refreshToken,
                            com_info: {
                                com_id: checkTypeUser._id,
                                com_email: checkTypeUser.email,
                            }
                        }
                        data.type_user = type_user
                        return functions.success(res, 'Đăng nhập thành công bằng email', { data })

                    } else {
                        return functions.setError(res, "sai tai khoan hoac mat khau")
                    }
                } else {
                    functions.setError(res, "không tìm thấy tài khoản ")
                }
            } else {
                return functions.setError(res, "không đúng định dạng email", 404)
            }
        } else {
            return functions.setError(res, "thiếu dữ liệu email hoặc sdt hoặc password ", 404)

        }
    } catch (error) {
        return functions.setError(res, error.message)
    }
}

// hàm đổi mật khẩu 
exports.updatePasswordbyToken = async(req, res, next) => {
    try {
        let idQLC = req.user.data.idQLC
        let old_password = req.body.old_password
        let password = req.body.password;
        let re_password = req.body.re_password;
        let checkPassword = await functions.verifyPassword(password)
        if (checkPassword) {
            return functions.setError(res, "sai dinh dang Mk", 404)
        }
        if (!password || !re_password) {
            return functions.setError(res, 'điền thiếu thông tin', 400)
        }
        if (password.length < 6) {
            return functions.setError(res, 'Password quá ngắn', 400)
        }
        if (password !== re_password) {
            return functions.setError(res, 'Password nhập lại không trùng khớp', 400)
        }
        if (old_password) {
            let checkOldPassword = await Users.findOne({ idQLC: idQLC, password: md5(old_password), type: 2 })
            if (!checkOldPassword) {
                functions.setError(res, 'Mật khẩu cũ không đúng, vui lòng kiểm tra lại', 400)
            } else {
                let checkPass = await functions.getDatafindOne(Users, { idQLC, password: md5(password), type: 2 })
                if (!checkPass) {
                    await Users.updateOne({ idQLC: idQLC, type: 2 }, {
                        $set: {
                            password: md5(password),
                        }
                    });
                    return functions.success(res, 'cập nhập thành công')
                }
                return functions.setError(res, 'mật khẩu đã tồn tại, xin nhập mật khẩu khác ', 404)
            }
        }

    } catch (error) {
        return functions.setError(res, error.message)
    }
}
exports.updatePasswordbyInput = async(req, res, next) => {
        try {
            let phoneTK = req.body.phoneTK
            let email = req.body.email
            let password = req.body.password;
            let re_password = req.body.re_password;
            if (phoneTK && password) {
                let checkPassword = await functions.verifyPassword(password)
                if (checkPassword) {
                    return functions.setError(res, "sai dinh dang Mk", 404)
                }
                if (!password || !re_password) {
                    return functions.setError(res, 'Missing data', 400)
                }
                if (password.length < 6) {
                    return functions.setError(res, 'Password quá ngắn', 400)
                }
                if (password !== re_password) {
                    return functions.setError(res, 'Password nhập lại không trùng khớp', 400)
                }
                let checkPass = await functions.getDatafindOne(Users, { phoneTK, password: md5(password), type: 2 })
                if (!checkPass) {
                    await Users.updateOne({ phoneTK: phoneTK, type: 2 }, {
                        $set: {
                            password: md5(password),
                        }
                    });
                    return functions.success(res, 'cập nhập thành công')
                }
                return functions.setError(res, 'mật khẩu đã tồn tại, xin nhập mật khẩu khác ', 404)
            } else if (email && password) {
                let checkPassword = await functions.verifyPassword(password)
                if (checkPassword) {
                    return functions.setError(res, "sai dinh dang Mk", 404)
                }
                if (!password || !re_password) {
                    return functions.setError(res, 'Missing data', 400)
                }
                if (password.length < 6) {
                    return functions.setError(res, 'Password quá ngắn', 400)
                }
                if (password !== re_password) {
                    return functions.setError(res, 'Password nhập lại không trùng khớp', 400)
                }
                let checkPass = await functions.getDatafindOne(Users, { email, password: md5(password), type: 2 })
                if (!checkPass) {
                    await Users.updateOne({ email: email, type: 2 }, {
                        $set: {
                            password: md5(password),
                        }
                    });
                    return functions.success(res, 'cập nhập thành công')
                }
                return functions.setError(res, 'mật khẩu đã tồn tại, xin nhập mật khẩu khác ', 404)

            } else {
                return functions.setError(res, ' điền thiếu trường ', 404)
            }

        } catch (error) {
            return functions.setError(res, error.message)
        }
    }
    // hàm cập nhập thông tin nhan vien

exports.updateInfoEmployee = async(req, res, next) => {
    try {
        let idQLC = req.user.data.idQLC;
        let data = [];
        let data1 = [];
        const { userName, email, phoneTK, password, com_id, address, position_id, dep_id, phone, group_id, birthday, gender, married, experience, startWorkingTime, education, otp } = req.body;
        let updatedAt = new Date()
        let File = req.files || null;
        let avatarUser = null;
        if ((idQLC) !== undefined) {
            let findUser = Users.findOne({ idQLC: idQLC, type: 2 })
            if (findUser) {
                if (File && File.avatarUser) {
                    let upload = fnc.uploadFileQLC('avt_ep', idQLC, File.avatarUser, ['.jpeg', '.jpg', '.png']);
                    if (!upload) {
                        return functions.setError(res, 'Định dạng ảnh không hợp lệ', 400)
                    }
                    avatarUser = fnc.createLinkFileQLC('avt_ep', idQLC, File.avatarUser.name)

                    data = await Users.updateOne({ idQLC: idQLC, type: 2 }, {
                        $set: {
                            userName: userName,
                            email: email,
                            phoneTK: phoneTK,
                            phone: phone,
                            avatarUser: avatarUser,
                            "inForPerson.employee.position_id": position_id,
                            "inForPerson.employee.com_id": com_id,
                            "inForPerson.employee.dep_id": dep_id,
                            address: address,
                            otp: otp,
                            authentic: null || 0,
                            fromWeb: "quanlichung",
                            avatarUser: avatarUser,
                            updatedAt: Date.parse(updatedAt),
                            "inForPerson.employee.group_id": group_id,
                            "inForPerson.account.birthday": birthday,
                            "inForPerson.account.gender": gender,
                            "inForPerson.account.married": married,
                            "inForPerson.account.experience": experience,
                            "inForPerson.employee.startWorkingTime": startWorkingTime,
                            "inForPerson.account.education": education,
                        }
                    })
                    await functions.success(res, 'update avartar user success', { data })



                } else {
                    data1 = await Users.updateOne({ idQLC: idQLC, type: 2 }, {
                        $set: {
                            userName: userName,
                            email: email,
                            phoneTK: phoneTK,
                            phone: phone,
                            avatarUser: avatarUser,
                            "inForPerson.employee.position_id": position_id,
                            "inForPerson.employee.com_id": com_id,
                            "inForPerson.employee.dep_id": dep_id,
                            address: address,
                            otp: otp,
                            authentic: null || 0,
                            fromWeb: "quanlichung",
                            // avatarUser: avatarUser,
                            updatedAt: Date.parse(updatedAt),
                            "inForPerson.employee.group_id": group_id,
                            "inForPerson.account.birthday": birthday,
                            "inForPerson.account.gender": gender,
                            "inForPerson.account.married": married,
                            "inForPerson.account.experience": experience,
                            "inForPerson.employee.startWorkingTime": startWorkingTime,
                            "inForPerson.account.education": education,
                        }
                    })
                    return functions.success(res, 'update 1 user success', { data1 })
                }
            } else {
                return functions.setError(res, "không tìm thấy user")

            }

        } else {
            return functions.setError(res, "không tìm thấy token")
        }
    } catch (error) {
        return functions.setError(res, error.message)
    }
}

// hàm quên mật khẩu
exports.forgotPassword = async(req, res) => {
    try {
        let otp = req.body.ma_xt || null
        let phoneTK = req.body.phoneTK;
        let email = req.body.email;
        let password = req.body.password;
        let re_password = req.body.re_password;
        let data = []
        if ((phoneTK || email) && (!otp)) {
            let checkMail = await functions.checkEmail(email)
            let checkPhone = await functions.checkPhoneNumber(phoneTK)
            if (checkMail || checkPhone) {
                let findUser = await Users.findOne({ $or: [{ email: email, type: 2 }, { phoneTK: phoneTK, type: 2 }] })
                if (findUser) {
                    let otp = functions.randomNumber
                    data = await Users.updateOne({ $or: [{ email: email, type: 2 }, { phoneTK: phoneTK, type: 2 }] }, {
                        $set: {
                            otp: otp
                        }
                    })
                    return functions.success(res, "Gửi mã OTP thành công", { data, otp })
                } else {
                    return functions.setError(res, "tài khoản không tồn tại")
                }
            } else {
                return functions.setError(res, " email không đúng định dạng ", 404)
            }

        } else if (otp && (phoneTK || email)) {
            let verify = await Users.findOne({ $or: [{ email: email, otp, type: 2 }, { phoneTK: phoneTK, otp, type: 2 }] });
            if (verify != null) {
                await Users.updateOne({ $or: [{ email: email, type: 2 }, { phoneTK: phoneTK, type: 2 }] }, {
                    $set: {
                        authentic: 1
                    }
                });
                await functions.success(res, "xác thực thành công");



            } else {
                return functions.setError(res, "xác thực thất bại", 404);
            }
        } else if (password && re_password) {
            let checkPassword = await functions.verifyPassword(password)
            if (!checkPassword) {
                return functions.setError(res, "sai dinh dang Mk", 404)
            }
            if (!password && !re_password) {
                return functions.setError(res, 'Missing data', 400)
            }
            if (password.length < 6) {
                return functions.setError(res, 'Password quá ngắn', 400)
            }
            if (password !== re_password) {
                return functions.setError(res, 'Password nhập lại không trùng khớp', 400)
            }
            await Users.updateOne({ $or: [{ email: email, authentic: 1, type: 2 }, { phoneTK: phoneTK, authentic: 1, type: 2 }] }, {
                $set: {
                    password: md5(password),
                }
            });
            return functions.success(res, 'cập nhập MK thành công')

        } else {
            return functions.setError(res, "thiếu dữ liệu", 404)
        }
    } catch (e) {
        return functions.setError(res, e.message)
    }
}


// show info
exports.info = async(req, res) => {
    try {
        const idQLC = req.user.data.idQLC
            // const com_id = req.user.data.com_id
        if ((idQLC) == undefined) {
            functions.setError(res, " không tìm thấy thông tin từ token ")
        } else {

            const data = await Users.findOne({ idQLC: idQLC, type: 2 }).select('userName email phone phoneTK address avatarUser authentic inForPerson.employee.position_id inForPerson.employee.com_id inForPerson.employee.dep_id inForPerson.account.birthday inForPerson.account.gender inForPerson.account.married inForPerson.account.experience inForPerson.account.education').lean()
            if (!data) {
                return functions.setError(res, 'không có dữ liệu ')

            } else {

                const data1 = data.inForPerson.employee.com_id
                const data0 = data.inForPerson.employee.dep_id
                const position_id = data.inForPerson.employee.position_id

                const birthday = data.inForPerson.account.birthday
                const gender = data.inForPerson.account.gender
                const married = data.inForPerson.account.married
                const experience = data.inForPerson.account.experience
                const education = data.inForPerson.account.education

                const departments = await Deparment.findOne({ _id: data0, com_id: data1 })
                if (!departments) {

                    data.birthday = birthday
                    data.position_id = position_id
                    data.gender = gender
                    data.married = married
                    data.experience = experience
                    data.education = education
                    return functions.success(res, 'Không có dữ phòng ban ', { data });
                } else {
                    const data2 = departments.managerId
                    const departmentName = departments.deparmentName
                    const companyName1 = await Users.findOne({ idQLC: data1, type: 1 }).select('userName').lean()
                    if (!companyName1) {
                        data.departmentName = departmentName
                        data.birthday = birthday
                        data.position_id = position_id
                        data.gender = gender
                        data.married = married
                        data.experience = experience
                        data.education = education
                        return functions.success(res, 'Không có dữ liệu ten cty  ', { data });
                    }
                    //tìm thấy tên công ty
                    const companyName = companyName1.userName

                    const managerName1 = await Users.findOne({ idQLC: data2, type: 2 }).select('userName').lean()
                    if (!managerName1) {
                        data.departmentName = departmentName

                        data.birthday = birthday
                        data.position_id = position_id
                        data.gender = gender
                        data.married = married
                        data.experience = experience
                        data.education = education
                        return functions.success(res, 'Không có dữ liệu ten truong phong   ', { data });
                    }
                    //tìm thấy tên trưởng phòng 
                    const managerName = managerName1.userName

                    data.departmentName = departmentName
                    data.managerName = managerName
                    data.companyName = companyName
                    data.birthday = birthday
                    data.position_id = position_id
                    data.gender = gender
                    data.married = married
                    data.experience = experience
                    data.education = education
                    if (data) {
                        return functions.success(res, 'Lấy thành công', { data });
                    };
                }
            }

            // return functions.setError(res, 'Không có dữ liệu', 404);
        }
    } catch (e) {
        return functions.setError(res, e.message)
    }
}