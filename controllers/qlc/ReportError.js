const report = require('../../models/qlc/ReportError')
const functions = require('../../services/functions')




exports.create = async(req, res) => {
    try {
        let { idQLC, type } = req.user.data;
        let { curDeviceId, detail_error, gallery_image_error, from_source } = req.body;
        let File = req.files || null;
        // gallery_image_error = null;
        let createdAt = new Date()

        if (!detail_error) {
            functions.setError(res, "chua nhap chi tiet")
        } else {
            let upload = functions.uploadFileQLC('Report_Error', idQLC, File.gallery_image_error, ['.jpeg', '.jpg', '.png']);
            if (!upload) {
                return functions.setError(res, 'Định dạng ảnh không hợp lệ', 400)
            }
            gallery_image_error = functions.createLinkFileQLC('Report_Error', idQLC, File.gallery_image_error.name)
            await Users.findByIdAndUpdate(idQLC, { gallery_image_error });

            let max = report.findOne({}, {}).sort({ _id: -1 }).limit(1).lean()
            let max1 = functions.getMaxID(report)
            let reports = new report({
                _id: Number(max) + 1 || 1,
                idQLC: idQLC,
                type: type,
                email: email,
                phoneTK: phoneTK,
                curDeviceId: curDeviceId,
                detail_error: detail_error,
                gallery_image_error: gallery_image_error || null,
                createdAt: Date.parse(createdAt),
                from_source: from_source

            })
            await reports.save()
                .then(() => functions.success(res, "Đánh giá của bạn đã được gửi đi"))
                .catch((e) => functions.setError(res, e.message))
        }





    } catch (error) {
        return functions.setError(res, error)
    }

}