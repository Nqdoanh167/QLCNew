const functions = require('../../../services/CRM/CRMservice')
const Contract = require('../../../models/crm/Contract/FormContract')
const detailContract = require('../../../models/crm/Contract/DetailFormContract')

exports.addContract = async (req, res) => {
    try {
        const { 
            name,
            ep_id,
            id_file,
            created_at,
            new_field,
            old_field,
            index_field,
            default_field
         } = req.body;
        let File = req.files || null;
        let pathFile = null;
        let com_id = '';
        let file = []
        let detail = []
        if ((name  && id_file) == undefined) {
            functions.setError(res, "input required", 506);

        }else {

             if(req.data.user.type == 1) {
             com_id = req.user.data.idQLC
             //Lấy ID kế tiếp, nếu chưa có giá trị nào thì bằng 1
             let maxID = await functions.getMaxID(Contract);
             if (!maxID) {
                maxID = 0
            };
           let _id = Number(maxID) + 1;
            if (File.pathFile) {
                let upload = functions.upFileCRM('Form_Contract', _id, File.pathFile, ['.jpeg', '.jpg', '.png', '.doc', '.txt', 'docx']);
                console.log(upload)
                if (!upload) {
                    return functions.setError(res, 'file không hỗ trợ', 400)
                }
                pathFile = functions.createLinkFileCRM('Form_Contract', _id, File.pathFile.name)
                file = new Contract({
                    _id: _id,
                    name: name,
                    pathFile: pathFile,
                    com_id: com_id,
                    ep_id: ep_id,
                    id_file: id_file,
                    created_at: new Date(),
                });
                await file.save();
                let maxID1 = await functions.getMaxID(detailContract);
                if (!maxID1) {
                    maxID1 = 0
                };
                const _id1 = Number(maxID1) + 1;
                
                detail = new detailContract({
                    _id: _id1,
                    id_form_contract : _id, 
                    new_field : new_field,
                    old_field : old_field,
                    index_field : index_field,
                    default_field : default_field,
                });
                await detail.save();
            }

            await functions.success(res, "file upload created successfully", { file,detail })
             }
             if(req.data.user.type == 2) {
                com_id = req.user.data.inForPerson.employee.com_id
                let maxID = await functions.getMaxID(Contract);
             if (!maxID) {
                maxID = 0
            };
            let _id = Number(maxID) + 1;
            if (File.pathFile) {
                let upload = functions.upFileCRM('Form_Contract', _id, File.pathFile, ['.jpeg', '.jpg', '.png', '.doc', '.txt', 'docx']);
                console.log(upload)
                if (!upload) {
                    return functions.setError(res, 'file không hỗ trợ', 400)
                }
                pathFile = functions.createLinkFileCRM('Form_Contract', _id, File.pathFile.name)
                file = new Contract({
                    _id: _id,
                    name: name,
                    pathFile: pathFile,
                    com_id: com_id,
                    ep_id: ep_id,
                    id_file: id_file,
                    created_at: new Date(),
                });
                await file.save();
                let maxID1 = await functions.getMaxID(detailContract);
                if (!maxID1) {
                    maxID1 = 0
                };
                const _id1 = Number(maxID1) + 1;
                
                detail = new detailContract({
                    _id: _id1,
                    id_form_contract : _id, 
                    new_field : new_field,
                    old_field : old_field,
                    index_field : index_field,
                    default_field : default_field,
                });
                await detail.save();
            }

            await functions.success(res, "file upload created successfully", { file,detail })
             }
            
            

        }   
     }catch(err) {
        functions.setError(res, err.message, 509);

}
}

exports.editContract = async (req,res) =>{
    const {
        _id,
        ep_id,
        id_file,
        new_field,
        old_field,
        index_field,
        default_field
    } = req.body;
    let File = req.files || null;
    let pathFile = null;
    // if(com_id === id_file){}
    //cap nhat binh thuong
    const form = await Contract.findOne({ _id: _id });
    if (!form) {
        functions.setError(res, "form does not exist!", 510);
    } else {
        await Contract.findOneAndUpdate({ _id: _id }, {
            ep_id : ep_id,
            id_file : id_file,
            updated_at : new Date(),
        })
    }
    // meu upload file
    if (File.pathFile) {
        let upload = functions.upFileCRM('Form_Contract', _id, File.pathFile, ['.jpeg', '.jpg', '.png', '.doc','.txt','docx']);
        if (!upload) {
            return functions.setError(res, 'file không hỗ trợ',400)
        }
        pathFile = functions.createLinkFileCRM('Form_Contract', _id, File.pathFile.name)


    } else {

    const form = await Contract.findOne({ _id: _id });
    if (!form) {
        functions.setError(res, "form does not exist!", 510);
    } else {
        await Contract.findOneAndUpdate({ _id: _id }, {
            pathFile : pathFile,
            ep_id : ep_id,
            id_file : id_file,
            updated_at : new Date(),
            
        })

            .then((form) => functions.success(res, "Deparment edited successfully", {form}))
            .catch((err) => functions.setError(res, err.message, 511))
    ;}

    // luu vao bang detail contract
    await detailContract.findOneAndUpdate({ id_form_contract: _id }, {
        new_field : new_field,
        old_field : old_field,
        index_field : index_field,
        default_field : default_field,
    })
    .then((form) => functions.success(res, "Deparment edited successfully", {form}))
    .catch((err) => functions.setError(res, err.message, 511))
}
}


exports.deleteContract = async (req,res) =>{
    try{
     const {_id } = req.body;
    const data = await Contract.findOne({_id:_id})
    if(!data){
        functions.setError(res," hop dong k ton tai ")
    }else{
       const result = await Contract.findOneAndUpdate({_id:_id},{$set : {is_delete : 1}})
        functions.success(res," xoa thanh cong ", {result})
       }
    }
    catch (error) {
        console.error('Failed to delete', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình xử lý.' });
    }
    
}


exports.deleteDetailContract = async (req,res) =>{
    try{
        const {_id } = req.body;
        const data = await detailContract.findOne({id_form_contract: _id })
        if(!data){
            functions.setError(res," chi tiet hop dong k ton tai")
        }else {
            const result = await detailContract.deleteOne({id_form_contract: _id })
            functions.success(res," xoa thanh cong ", {result})
        }
    } catch (error) {
        console.error('Failed to delete', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình xử lý.' });
    }
    
}



//thêm try catch, checktoken