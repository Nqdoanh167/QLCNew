const feedback = require("../../models/qlc/Feedback")
const feedback_emp = require("../../models/qlc/Feedback_emp")
const functions = require('../../services/functions')


exports.create = async(req, res) => {
    let idQLC = req.user.data.idQLC
    let { rating, feed_back, app_name, from_source, type } = req.body
    let createdAt = new Date()
    if ((idQLC && type && rating && feed_back) == undefined) {
        functions.setError(res, "lost info")
    } else {
        const max = await feedback.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean()

        let feedbacks = new feedback({
            _id: Number(max._id) + 1 || 1,
            idQLC: idQLC,
            type: type,
            feed_back: feed_back,
            rating: rating,
            createdAt: Date.parse(createdAt),
            app_name: app_name || null,
            from_source: from_source || null,

        })
        await feedbacks.save()
            .then(() => functions.success(res, 'thanh cong', { feedbacks }))
            .catch((e) => functions.setError(res, e.message))
    }
}
exports.createFeedEmp = async(req, res) => {
    try {
        let idQLC = req.user.data.idQLC
        let { cus_id, rating, feed_back, app_name, from_source, email, phone_number, name } = req.body
        let createdAt = new Date()
        if ((idQLC && rating && feed_back) == undefined) {
            functions.setError(res, "lost info")
        } else {
            const max = await feedback_emp.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean()
            if (!max) {
                return max = 0
            }
            console.log(max)
            let feedbacks = new feedback_emp({
                _id: Number(max._id) + 1,
                idQLC: idQLC,
                cus_id: cus_id,
                email: email,
                phone_number: phone_number,
                name: name,
                feed_back: feed_back,
                rating: rating,
                createdAt: Date.parse(createdAt),
                app_name: app_name || null,
                from_source: from_source || null,

            })
            await feedbacks.save()
                .then(() => functions.success(res, 'thanh cong', { feedbacks }))
                .catch((e) => functions.setError(res, e.message))
        }
    } catch (e) {
        return functions.setError(res, e.message)
    }
}