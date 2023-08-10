// check ảnh và video
const fs = require('fs');

// upload file
const multer = require('multer')

// gửi mail
const nodemailer = require("nodemailer");
// tạo biến môi trường
const dotenv = require("dotenv");
// mã hóa mật khẩu
const crypto = require('crypto');
// gọi api
const axios = require('axios')

// check video
const path = require('path');
//check ảnh
const { promisify } = require('util');


// giới hạn dung lượng video < 100MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
// danh sách các loại video cho phép
const allowedTypes = ['.mp4', '.mov', '.avi', '.wmv', '.flv'];
// giới hạn dung lượng ảnh < 2MB
const MAX_IMG_SIZE = 10 * 1024 * 1024;
// giới hạn dung lượng kho ảnh
exports.MAX_Kho_Anh = 300 * 1024 * 1024;

const functions = require('../functions');

// import model
const AdminUserRaoNhanh365 = require('../../models/Raonhanh365/Admin/AdminUser');

dotenv.config();

// hàm tạo link title
exports.createLinkTilte = (input) => {
    input = input.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    str = input.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.toLowerCase();
    str = str.replaceAll(' ', '-')
    return str
}
exports.deleteFileRaoNhanh = (id, file) => {
    let filePath = `../Storage/base365/raonhanh365/pictures/avt_tindangmua/${id}/` + file;
    fs.unlink(filePath, (err) => {
        if (err) console.log(err);
    });
}
exports.checkNameCateRaoNhanh = async(data)=>{
    switch (data)
    {
        case 'Đồ điện tử':
            return 'electroniceDevice'
        case 'Xe cộ':
            return 'vehicle'
        case 'Bất động sản':
            return 'realEstate'
        case 'Ship':
            return 'ship'
        case 'Thú cưng':
            return 'pet'   
        case 'Việc làm':
            return 'job'
        case 'Thực phẩm, Đồ uống':
            return 'food' 
        case 'Đồ gia dụng': 
            return 'wareHouse'
        case 'Sức khỏe - Sắc đẹp': 
            return 'beautifull'
        case 'Thể thao': 
            return 'Thể thao'
        case 'Du lịch': 
            return 'Du lịch'
        case 'Đồ dùng văn phòng, công nông nghiệp': 
            return 'Đồ dùng văn phòng, công nông nghiệp' 
}}
exports.checkFolderCateRaoNhanh = async(data)=>{
    switch (data)
    {
        case 'electroniceDevice':
            return 'do_dien_tu'
        case 'vehicle':
            return 'dangtin_xeco'
        case 'realEstate':
            return 'dangtin_bds'
        case 'ship':
            return 'dangtin_ship'
        case 'pet':
            return 'dangtin_thucung'   
        case 'job':
            return 'timviec'
        case 'food':
            return 'thuc_pham' 
        case 'wareHouse': 
            return 'noi_ngoai_that'
        case 'beautifull': 
            return 'dangtin_suckhoesacdep'
        case 'Thể thao': 
            return 'dtin_thethao'
        case 'Du lịch': 
            return 'du_lich'
        case 'Đồ dùng văn phòng, công nông nghiệp': 
            return 'dangtin_dodung'
    } 
}
// hàm tạo link file rao nhanh 365
exports.createLinkFileRaonhanh = (folder, id, name) => {
    let link = process.env.DOMAIN_RAO_NHANH + '/base365/raonhanh365/pictures/' + folder + '/' + id + '/' + name;
    return link;
}


exports.uploadFileRaoNhanh = async (folder, id, file,allowedExtensions) => {

    let path1 = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/`;
    let filePath = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/` + file.name;

    let fileCheck =  path.extname(filePath);
    if(allowedExtensions.includes(fileCheck.toLocaleLowerCase()) === false)
    {
        return false
    }
    // const { size } = await promisify(fs.stat)(filePath);
    // if (size > MAX_IMG_SIZE) {
    //     return false;
    // }
    
    if (!fs.existsSync(path1)) {   
        fs.mkdirSync(path1, { recursive: true });
    }
    fs.readFile(file.path, (err, data) => {
        if (err) {
            console.log(err)
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
            console.log(err)
            }
        });
    });
    return true
}

exports.uploadFileRN2 = (folder, id, file) => {
    let path1 = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/`;
    let filePath = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/` + file.name;
    let fileCheck =  path.extname(filePath);
    if (!fs.existsSync(path1)) {   
        fs.mkdirSync(path1, { recursive: true });
    }
    fs.readFile(file.path, (err, data) => {
        if (err) {
            console.log(err)
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
            console.log(err)
            }
        });
    });
    return true
}
exports.uploadFileBase64RaoNhanh = async(folder, id, base64String, file)=>{
    let path1 = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/`;
    // let filePath = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/` + file.name;
    if (!fs.existsSync(path1)) {
        fs.mkdirSync(path1, { recursive: true });
    }
    var matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches.length !== 3) {
        return false;
    }

    let type = matches[1];
    let data = Buffer.from(matches[2], 'base64');

    const imageName = `${Date.now()}.${type.split("/")[1]}`;
    fs.writeFile(path1+imageName, data, (err) => {
        if (err) {
        console.log(err)
        }
    });
}

// ham check admin rao nhanh 365
exports.isAdminRN365 = async(req, res, next)=>{
    let user = req.user.data;
    // console.log(user)
    let admin = await functions.getDatafindOne(AdminUserRaoNhanh365, { _id: user._id, isAdmin: 1, active: 1 });
    if(admin) return next();
    return res.status(403).json({ message: "is not admin RN365" });
}