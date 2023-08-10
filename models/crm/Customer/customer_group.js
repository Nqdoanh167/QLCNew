const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crm_customer_group = new Schema({
    gr_id: {
        type: Number,
        require: true
    },
    gr_name: {
        type: String
    },
    gr_description: {
        type: String
    },
    group_parent: {
        type: Number,
        default: 0,
    },
    company_id: {
        type: Number,
        require: true
    },
    dep_id: {
        type: String
    },
    emp_id: {
        type: String
    },
    count_customer: {
        type: Number
    },
    is_delete: {
        type: Number
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
}, {
    collection: 'CRM_customer_group',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("crm_customer_group ", crm_customer_group);