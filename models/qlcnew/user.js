const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    _id: {
        type: Number
    },
    com_id: {
        type: Number
    },

    is_superadmin: {
        type: Boolean,
        default: false
    },

    profile: {
        first_name: {
            type: String
        },
        last_name: {
            type: String
        },
        phone_number: {
            type: String
        },
        contact_email: {
            type: String
        },
        date_of_birth: {
            type: Date
        },
        gender: {
            type: String,
            enum: ["Nam", "Nữ"]
        },
        address: {
            type: String
        },
        img_url: {
            type: String
        }
    },

    is_user: {
        type: Boolean
    },
    is_employee: {
        type: Boolean
    },

    user_email: {
        type: String
    },

    em_id: {
        type: String
    },

    com_email: {
        type: String
    },

    //Đơn vị công tác
    work_unit_id: {
        type: String
    },
    //Chức vụ
    position_id: {
        type: String
    },
    //Ngày bắt đầu thử việc
    work_trial_start: {
        type: Date
    },
    //Ngày vào làm chính thức
    work_official_start: {
        type: Date
    },
    //Trạng thái làm việc
    work_status: {
        type: Number
    },

   
    is_verified: {
        type: Boolean,
        default: false
    },
    is_approved: {
        type: Boolean,
        default: false,
    },

    is_deleted: {
        type: Boolean,
        default: false
    },

    //Created timestamp
    createAt: {
        type: Date,
        default: Date.now
    },
    applications: [String],
});
module.exports = mongoose.model("User", UserSchema);