const PermissionNotify = require('../../models/Timviec365/PermissionNotify');
const functions = require('../../services/functions');

exports.HandlePermissionNotify = async(pn_use_id, listPermissions) => {
    if (listPermissions) {
        const list = JSON.stringify(listPermissions);
        for (let i = 0; i < list.length; i++) {
            const element = list[i],
                pn_id_chat = element.pn_id_chat,
                type_noti = element.type_noti,
                itemMax = await PermissionNotify.findOne({}, { pn_id: 1 }).sort({ pn_id: -1 }).limit(1).lean(),
                item = new PermissionNotify({
                    pn_id: Number(itemMax.pn_id) + 1,
                    pn_use_id: pn_use_id,
                    pn_id_chat: pn_id_chat,
                    pn_type: 0,
                    pn_type_noti: type_noti,
                    pn_created_at: functions.getTimeNow()
                });
            await item.save();
        }
    }
}