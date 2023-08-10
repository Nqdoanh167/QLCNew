const functions = require("../../services/functions")
const user = require("../../models/Users")


exports.check1 = async (req, res) => {
    try {
        const idQLC = req.user.data.idQLC
        let data = []
        let count = []
        let is_add = []
        let vip = []
        const timeStart = "2023-05-20 23:59:59"

        data = await user.findOne({ idQLC: idQLC, type: 1 }).select("inForCompany.cds.com_vip inForCompany.cds.com_vip_time inForCompany.cds.com_ep_vip createdAt").lean()
        if (data) {
            const createdAt = data.createdAt
            count = await user.countDocuments({ idQLC: idQLC }).lean()
            const comVip = data.inForCompany.cds.com_vip
            const timeVip = data.inForCompany.cds.com_vip_time
            const userVip = data.inForCompany.cds.com_ep_vip
            const startTime = new Date(timeStart);
            const createdTime = new Date(createdAt);
            const now = new Date()

            const timeVips = new Date(timeVip)

            if (createdTime < startTime) {
                if (comVip == 1) {
                    vip = true

                    functions.success(res, "Cong ty tạo trước 20/05/20 va VIP",{vip})
                } else if (comVip == 0) {
                    vip = false
                    
                    functions.success(res, "Cong ty tạo trước 20/05/20 va thường",{vip})
                } else {
                    functions.setError(res, "Công ty tạo trước 20/05/20, vip không xác định ")

                }
            } else if (createdTime > startTime) {
                if (timeVip == 0) {//vip

                    if (count >= userVip) {
                        if (comVip == 0) {
                            is_add = false
                            vip = false

                            functions.success(res, "Cong ty tạo sau 20/05/20 và cty thường và số lượng nhân viên vượt quá gói mặc định",{is_add,vip})
                            
                        } else {
                            is_add = false
                            vip = true

                            functions.success(res, "Cong ty tạo sau 20/05/20 và cty vip và số lượng nhân viên vượt quá gói mặc định",{is_add,vip})

                        }
                    } else {
                        if (comVip == 0) {
                            is_add = true
                            vip = false
                            functions.success(res, "Cong ty tạo sau 20/05/20 và cty thường và con them duoc nhan vien ",{is_add,vip})
                        } else {
                            is_add = true
                            vip = true

                            functions.success(res, "Cong ty tạo sau 20/05/20 và cty vip và con them duoc nhan vien ",{is_add,vip})

                        }
                    }


                } else {//
                    if (now >= timeVips) {//het han vip
                        if (count >= userVip) {
                            vip = false
                            is_add = false

                            functions.success(res, "Cong ty tạo sau 20/05/20 va het han VIP va số lượng nhân viên vượt quá góp vip",{is_add,vip})

                        } else {
                            is_add = true
                            vip = false

                            functions.success(res, "Cong ty tạo sau 20/05/20 va het han VIP va con  them duoc nhân viên vip",{is_add,vip})
                        }

                    } else { // con han vip
                        if (count >= userVip) {
                            is_add = false
                            vip = true

                            functions.success(res, "Cong ty tạo sau 20/05/20 va VIP va số lượng nhân viên vượt quá góp vip",{is_add,vip})
                        } else {
                            is_add = true
                            vip = true

                            functions.success(res, "Cong ty tạo sau 20/05/20 va VIP va con  them duoc nhân viên vip",{is_add,vip})

                        }
                    }
                }



            } else {
                functions.success(res,"Thời gian tạo lập và thời gian bắt đầu bằng nhau");
            }
        } else {
            functions.success(res, " Công ty không tồn tại ")
        }

    } catch (e) {
        functions.setError(res, e.message)
    }
}

exports.check2 = async (req, res) => {
    try {
        const com_id = req.body.com_id
        let data = []
        let count = []

        const timeStart = "2023-05-20 23:59:59"

        data = await user.findOne({ idQLC: com_id, type: 1 }).select("inForCompany.cds.com_vip inForCompany.cds.com_vip_time inForCompany.cds.com_ep_vip createdAt").lean()
        if (data) {
            const createdAt = data.createdAt
            count = await user.countDocuments({ idQLC: com_id }).lean()
            const comVip = data.inForCompany.cds.com_vip
            const timeVip = data.inForCompany.cds.com_vip_time
            const userVip = data.inForCompany.cds.com_ep_vip
            const startTime = new Date(timeStart);
            const createdTime = new Date(createdAt);
            const now = new Date()

            const timeVips = new Date(timeVip)

            if (createdTime < startTime) {
                if (comVip == 1) {
                    vip = true

                    functions.success(res, "Cong ty tạo trước 20/05/20 va VIP",{vip})
                } else if (comVip == 0) {
                    vip = false
                    
                    functions.success(res, "Cong ty tạo trước 20/05/20 va thường",{vip})
                } else {
                    functions.setError(res, "Công ty tạo trước 20/05/20, vip không xác định ")

                }
            } else if (createdTime > startTime) {
                if (timeVip == 0) {//vip

                    if (count >= userVip) {
                        if (comVip == 0) {
                            is_add = false
                            vip = false

                            functions.success(res, "Cong ty tạo sau 20/05/20 và cty thường và số lượng nhân viên vượt quá gói mặc định",{is_add,vip})
                            
                        } else {
                            is_add = false
                            vip = true

                            functions.success(res, "Cong ty tạo sau 20/05/20 và cty vip và số lượng nhân viên vượt quá gói mặc định",{is_add,vip})

                        }
                    } else {
                        if (comVip == 0) {
                            is_add = true
                            vip = false
                            functions.success(res, "Cong ty tạo sau 20/05/20 và cty thường và con them duoc nhan vien ",{is_add,vip})
                        } else {
                            is_add = true
                            vip = true

                            functions.success(res, "Cong ty tạo sau 20/05/20 và cty vip và con them duoc nhan vien ",{is_add,vip})

                        }
                    }


                } else {//
                    if (now >= timeVips) {//het han vip
                        if (count >= userVip) {
                            vip = false
                            is_add = false

                            functions.success(res, "Cong ty tạo sau 20/05/20 va het han VIP va số lượng nhân viên vượt quá góp vip",{is_add,vip})

                        } else {
                            is_add = true
                            vip = false

                            functions.success(res, "Cong ty tạo sau 20/05/20 va het han VIP va con  them duoc nhân viên vip",{is_add,vip})
                        }

                    } else { // con han vip
                        if (count >= userVip) {
                            is_add = false
                            vip = true

                            functions.success(res, "Cong ty tạo sau 20/05/20 va VIP va số lượng nhân viên vượt quá góp vip",{is_add,vip})
                        } else {
                            is_add = true
                            vip = true

                            functions.success(res, "Cong ty tạo sau 20/05/20 va VIP va con  them duoc nhân viên vip",{is_add,vip})

                        }
                    }
                }



            } else {
                functions.success(res,"Thời gian tạo lập và thời gian bắt đầu bằng nhau");
            }
        } else {
            functions.success(res, " Công ty không tồn tại ")
        }

    } catch (e) {
        functions.setError(res, e.message)
    }
}