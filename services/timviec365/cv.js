const functions = require("../functions");

exports.rewrite_cv_download = (cvid, uid, cvname) => {
    return `${functions.siteName()}/cv365/download-cvpdf/cv.php?cvid=${cvid}&uid=${uid}&cvname=${cvname}`;
}

exports.rewrite_cv_download = (cvid, uid, cvname) => {
    return `${functions.siteName()}/cv365/download-cvpdf/don.php?id=${cvid}&uid=${uid}&cvname=${cvname}`;
}


exports.rewrite_cv_update = (url_alias) => {
    return `${functions.siteName()}/cv365/tao-cv-${url_alias}`;
}

exports.rewrite_cv_xem = (url_alias) => {
    return `${functions.siteName()}/cv365/${url_alias}`;
}

exports.getImageCv = (uid, image) => {
    return `${functions.hostCDN()}/cv365/upload/ungvien/uv_${uid}/${image}.png`;
}


exports.rewrite_don_update = (url_alias) => {
    return `${functions.siteName()}/cv365/tao-don-xin-viec/${url_alias}`;
}

exports.save = async() => {

}