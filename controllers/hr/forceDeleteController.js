const functions = require('../../services/functions');
const hrService = require('../../services/hr/hrService');
const Recruitment = require('../../models/hr/Recruitment');
const RecruitmentNews = require('../../models/hr/RecruitmentNews');
const JobDescription = require('../../models/hr/JobDescriptions');
const ProcessTraining = require('../../models/hr/ProcessTraining');
const ProvisionOfCompanys = require('../../models/hr/ProvisionOfCompanys');
const EmployeePolicys = require('../../models/hr/EmployeePolicys');

//lay ra danh sach du lieu xoa cac cua cac muc
let getDelete = async(module, condition, fields)=>{
  try{
    let data = await module.find(condition, fields);
    let total = await module.countDocuments(condition);
    return {total, data};
  }catch(e){
    console.log(e);
  }
}

let deleteModule = async(module, arrDelete)=>{
  try{
    for(let i=0; i<arrDelete.length; i++){
      await module.deleteOne({id: arrDelete[i]});
    }
  }catch(e){
    console.log(e);
  }
}

let restoreModule = async(module, arrDelete)=>{
  try{
    for(let i=0; i<arrDelete.length; i++){
      let id = Number(arrDelete[i])
      await module.findOneAndUpdate({id: id}, {isDelete: 0, deleteAt: null});
    }
  }catch(e){
    console.log(e);
  }
}

let removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

//api lay ra danh sach
exports.listDetailDelete = async(req, res, next) => {
  try{
    let keyword = req.body.keyword;
    let comId = req.infoLogin.comId;
    let condition = {comId: comId, isDelete: 1};
    let condition2 = {comId: comId, isDelete: 1};
    let fields = {id: 1, name: 1, deleteAt: 1};
    let fields2 = {id: 1, title: 1, deleteAt: 1};
    
    if(keyword) {
      condition.name = new RegExp(keyword, 'i');
      condition2.title = new RegExp(keyword, 'i');
    }
    let list_recuitment = await getDelete(Recruitment, condition, fields);
    let list_recuitment_new = await getDelete(RecruitmentNews, condition2, fields2);
    let list_job_desc = await getDelete(JobDescription, condition, fields);
    let list_training_process = await getDelete(ProcessTraining, condition, fields);
    let list_provision = await getDelete(ProvisionOfCompanys, condition, fields);
    let list_employe_policy = await getDelete(EmployeePolicys, condition, fields);
    return functions.success(res, "Get list detail delete success", {list_recuitment, list_recuitment_new, list_job_desc, list_training_process, list_provision, list_employe_policy});
  }catch(err){
    console.log(err);
    return functions.setError(res, err);
  }
}

//-----api xoa vinh vien 
exports.delete= async(req, res, next) => {
    try {
        let {list_recuitment, list_recuitment_new, list_job_desc, list_training_process, list_provision, list_employe_policy} = req.body;

        //xoa dl module tuyen dung
        if(list_recuitment) {
          let arr_recuitment = list_recuitment.split(', ');
          await deleteModule(Recruitment, arr_recuitment);
        }

        if(list_recuitment_new) {
          let arr_recuitment_new = list_recuitment_new.split(', ');
          await deleteModule(RecruitmentNews, arr_recuitment_new);
        }

        if(list_job_desc) {
          let arr_job_desc = list_job_desc.split(', ');
          await deleteModule(JobDescription, arr_job_desc);
        }

        if(list_training_process) {
          let arr_training_process = list_training_process.split(', ');
          await deleteModule(ProcessTraining, arr_training_process);
        }

        if(list_provision) {
          let arr_provision = list_provision.split(', ');
          await deleteModule(ProvisionOfCompanys, arr_provision);
        }

        if(list_employe_policy) {
          let arr_employe_policy = list_employe_policy.split(', ');
          await deleteModule(EmployeePolicys, arr_employe_policy);
        }
        return functions.success(res, "Delete success");
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}


//----api khoi phuc du lieu
exports.restoreDelete= async(req, res, next) => {
    try {
        let {list_recuitment, list_recuitment_new, list_job_desc, list_training_process, list_provision, list_employe_policy} = req.body;

        //khoi phuc
        if(list_recuitment) {
          let arr_recuitment = list_recuitment.split(', ');
          await restoreModule(Recruitment, arr_recuitment);
        }

        if(list_recuitment_new) {
          let arr_recuitment_new = list_recuitment_new.split(', ');
          await restoreModule(RecruitmentNews, arr_recuitment_new);
        }

        if(list_job_desc) {
          let arr_job_desc = list_job_desc.split(', ');
          await restoreModule(JobDescription, arr_job_desc);
        }

        if(list_training_process) {
          let arr_training_process = list_training_process.split(', ');
          await restoreModule(ProcessTraining, arr_training_process);
        }

        if(list_provision) {
          let arr_provision = list_provision.split(', ');
          await restoreModule(ProvisionOfCompanys, arr_provision);
        }

        if(list_employe_policy) {
          let arr_employe_policy = list_employe_policy.split(', ');
          await restoreModule(EmployeePolicys, arr_employe_policy);
        }
        
        return functions.success(res, "Restore delete success");
    } catch (e) {
        console.log("Err from server", e);
        return functions.setError(res, "Err from server", 500);
    }
}