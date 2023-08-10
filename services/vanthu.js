
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const dotenv = require("dotenv");
dotenv.config();
const path = require('path');

exports.uploadFileVanThu = (id, file) => {
    let path = `../Storage/base365/vanthu/dexuat/${id}/`;
    let filePath = `../Storage/base365/vanthu/dexuat/${id}/` + file.originalFilename;

    if (!fs.existsSync(path)) { // Nếu thư mục chưa tồn tại thì tạo mới
        fs.mkdirSync(path, { recursive: true });
    }

    fs.readFile(file.path, (err, data) => {
        if (err) {
            console.log(err)
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log(" luu thanh cong ");
            }
        });
    });
}
exports.createLinkFileVanthu = (id, name) => {
    let link = process.env.DOMAIN_VAN_THU + '/base365/vanthu/dexuat' + '/' + id + '/' + name;
    return link;
}

exports.getMaxID = async(model) => {
    const maxUser = await model.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
    return maxUser._id + 1;
};

// const storageVanthu = (destination) => {
//     return storage = multer.diskStorage({
//         destination: (req, file, cb) => {
//             // console.log(file_kem)
//             cb(null, destination);
//         },
//         filename: (req, file, cb) => {
//             cb(null, Date.now() + path.extname(file));
//         }
//     })

// };
// exports.upload = multer({ storage: storageVanthu('../../../Storage/VanThu') });
exports.chat = async (id_user, id_user_duyet, com_id, name_dx, id_user_theo_doi, status, link, file_kem) => {
    return await axios.post('http://43.239.223.142:9000/api/V2/Notification/NotificationOfferReceive', {
        SenderID: id_user,
        ListReceive: id_user_duyet,
        CompanyId: com_id,
        Message: name_dx,
        ListFollower: id_user_theo_doi,
        Status: status,
        Link: status,
        file_kem: file_kem,
        // SenderID :nguoi gui , ListReceive: nguoi duyet , CompanyId, Message: ten de_xuat,ListFollower: nguoi thoe doi,Status,Link
    }).then(function (response) {
        //  console.log("name_dx: " + name_dx + "user_dx :  " + user_dx + " noi_dung: " + noi_dung + " fileKem: " + fileKem);
    })
        .catch(function (error) {
            console.log(error);
        });
}

exports.uploadFileNameRandom = async(folder, file_img) => {
    let filename='';
    const time_created = Date.now();
    const date = new Date(time_created);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const dir = `../Storage/base365/vanthu/uploads/${folder}/${year}${month}${day}/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    filename = `${time_created}-tin-${file_img.originalFilename}`.replace(/,/g, '');
    const filePath = dir + filename;
    filename = filename + ',';
    // if (NameFile === '') {
    //     NameFile += `'${file_img.name.replace(/,/g, '')}'`;
    //     InfoFile += `'https://vanthu.timviec365.vn/uploads/file_van_ban/${year}/${month}/${day}/${filename}'`;
    // } else {
    //     NameFile += `,'${file_img.name.replace(/,/g, '')}'`;
    //     InfoFile += `,'https://vanthu.timviec365.vn/uploads/file_van_ban/${year}/${month}/${day}/${filename}'`;
    // }

    fs.readFile(file_img.path, (err, data) => {
        if (err) {
            console.log(err)
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                console.log(err)
            }
        });
    });
    return filename;
}

exports.getMaxId = async(model) => {
    let maxId = await model.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
    if (maxId) {
        maxId = Number(maxId._id) + 1;
    } else maxId = 1;
    return maxId;
}

exports.sendChat = async (link, data) => {
    return await axios
    .post(link, data)
    .then(response => {
        console.log(response.data);
        // Xử lý phản hồi từ server
    })
    .catch(error => {
        console.error(error);
        // Xử lý lỗi
    });
}

exports.checkToken = (req, res, next)=> {
    try{
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Missing token" });
        }
        jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token" });
            }
            // console.log(user.data);
            var infoLogin = {type: user.data.type, id: user.data.idQLC, name: user.data.userName};
            if(user.data.type!=1){
                if(user.data.inForPerson && user.data.inForPerson.employee && user.data.inForPerson.employee.com_id){
                    infoLogin.comId = user.data.inForPerson.employee.com_id;
                }else {
                    return res.status(404).json({ message: "Missing info inForPerson!" });
                }
            }else {
                infoLogin.comId = user.data.idQLC;
            }
            // if(type==1) req.ac = user.data.idQLC;

            req.comId = infoLogin.comId;
            req.infoLogin = infoLogin;
            next();
            
        });
    }catch(err){
        console.log(err);
        return res.status(503).json({ message: "Error from server!" });
    }
    
}

exports.arrAPI = ()=>{
    return {
        'NotificationOfferReceive': "http://43.239.223.142:9000/api/V2/Notification/NotificationOfferReceive",
        'NotificationOfferSent': "http://43.239.223.142:9000/api/V2/Notification/NotificationOfferSent",
        "NotificationReport": "http://43.239.223.142:9000/api/V2/Notification/NotificationReport",
        "SendContractFile": "http://43.239.223.142:9000/api/V2/Notification/SendContractFile"
    }
} 

exports.replaceTitle = (title) => {
  // Hàm replaceTitle() là hàm tùy chỉnh của bạn để thay thế các ký tự không hợp lệ trong tiêu đề
  // Hãy thay thế nó bằng cách xử lý phù hợp với yêu cầu của bạn
    return title.replace(/[^a-zA-Z0-9]/g, '-');
};

exports.uploadfile = async(folder, file_img) => {
    let filename='';
    const time_created = Date.now();
    const date = new Date(time_created);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const dir = `../Storage/base365/vanthu/uploads/${folder}/${year}/${month}/${day}/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    filename = `${file_img.originalFilename}`;
    const filePath = dir + filename;
    fs.readFile(file_img.path, (err, data) => {
        if (err) {
            console.log(err)
            return false
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                console.log(err)
                return false
            }
        });
    });
    let link = process.env.DOMAIN_VAN_THU + `/base365/vanthu/uploads/${folder}/${year}/${month}/${day}/${file_img.originalFilename}`;
    return link;
}
exports.deleteFile = (file) => {
    let namefile = file.replace(`${process.env.DOMAIN_VAN_THU}/base365/vanthu/uploads/`,'');
    let filePath = '../Storage/base365/vanthu/uploads/' + namefile;
    fs.unlink(filePath, (err) => {
        if (err) console.log(err);
    });
    
}