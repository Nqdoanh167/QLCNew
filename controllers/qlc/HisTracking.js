const Tracking = require('../../models/qlc/HisTracking');
const functions = require('../../services/functions')
const calEmp = require('../../models/qlc/CalendarWorkEmployee')
//thêm chấm công 
exports.CreateTracking = async (req,res)=>{
    

    const {idQLC, com_id, role,imageTrack,curDeviceName,latitude,longtitude,Location,NameWifi,IpWifi,MacWifi,shiftID ,BluetoothAdrr,Note,CreateAt,status,Err,Success,depID } = req.body;


    if ((idQLC &&  com_id &&  role && imageTrack && curDeviceName && latitude && longtitude && Location && NameWifi && IpWifi && MacWifi && shiftID  && BluetoothAdrr && Note && CreateAt && status && Err && Success)== undefined) {
        functions.setError(res, "some field required");
    }else if (isNaN(com_id)) {
        functions.setError(res, "Company id must be a number");
    }else if (isNaN(idQLC)) {
        functions.setError(res, "idQLC id must be a number");
    }else {
        let maxId = await functions.getMaxID(Tracking);
        if (!maxId) {
            maxId = 0;
        }
        const _id = Number(maxId) + 1;
        const tracking = new Tracking({
            _id: _id,
            idQLC: idQLC,
            com_id: com_id,
            depID: depID,
            role: role,
            imageTrack: imageTrack,
            CreateAt: new Date(),
            curDeviceName: curDeviceName,
            latitude: latitude,
            longtitude: longtitude,
            Location: Location,
            NameWifi: NameWifi,
            IpWifi: IpWifi,
            MacWifi: MacWifi,
            shiftID: shiftID,
            status: status,
            BluetoothAdrr: BluetoothAdrr,
            Err: Err,
            Success: Success,
            Note: Note


        });
        await tracking.save()
            .then(() => {
                functions.success(res, "Tracking successful", tracking)
            })
            .catch(err => {
                functions.setError(res, err.message)
            })
    }
};
// Set current date TimeStamp, eg: '1666512804163'
// TimeStamp: new Date().getTime().toString()

// Display saved TimeStamp, eg: '23/10/2022'
// new Date(parseInt(TimeStamp)).toLocaleDateString()

exports.getListUserTrackingSuccess = async (req,res)=>{


    try {
        const pageNumber = req.body.pageNumber || 1;
        const request = req.body;
        let com_id = request.com_id
            shiftID = request.shiftID
            CreateAt = request.CreateAt || true
            inputNew = request.inputNew 
            inputOld = request.inputOld
        if((com_id&&shiftID)==undefined){
            functions.setError(res,"lack of input")
        }else if(isNaN(com_id&&shiftID)){
            functions.setError(res,"id must be a Number")
        }else{
            const data = await Tracking.find({com_id: com_id ,shiftID : shiftID, CreateAt: { $gte: inputOld , $lte: inputNew } }).select('_id idQLC imageTrack Location CreateAt shiftID status Success ').skip((pageNumber - 1) * 20).limit(20).sort({ _id : -1});
            if (data) {//lấy thành công danh sách NV đã chấm công 
                //so sanh phan tu trung lap
                function compare(personA, personB) {
                    return personA.idQLC === personB.idQLC && personA.shiftID === personB.shiftID;
                    }
                
                let newData = functions.arrfil(data, compare);
                console.log(newData)
                    
            
                return await functions.success(res, 'Lấy thành công', { newData } );
            }
            return functions.setError(res, 'Không có dữ liệu', 404);
        }
   

    } catch (err) {
        functions.setError(res, err.message);
    };


};

exports.getlistUserNoneHistoryOfTracking = async (req, res) => {


    const   pageNumber = req.body.pageNumber || 1;
            CreateAt = req.body.CreateAt || true
            inputNew = req.body.inputNew  || null
            inputOld = req.body.inputOld   || null
            com_id = req.body.com_id;
            shiftID = req.body.shiftID
    //ta tìm danh sách lịch sử nhân viên của công ty đã chấm công   
    const data = await Tracking.find({ com_id: com_id,shiftID : shiftID, CreateAt: { $gte: inputOld , $lte: inputNew } }).select('_id idQLC shiftID ')
    //ta tìm danh sách nhân viên đã có lịch làm việc của công ty
    const data2 = await calEmp.find({ com_id: com_id,shiftID : shiftID,  }).select('_id idQLC shiftID  ')
    //ta so sánh 2 mảng 
    // Lọc ra các phần tử không giống nhau trong cả hai mảng

    function compareObjects(obj1, obj2) {
        return JSON.stringify(obj1.idQLC) === JSON.stringify(obj2.idQLC) ;
    }

    function removeSimilarElements(data, data2) {
        const newArray = data.filter(
            (item1) => !data2.some((item2) => compareObjects(item1, item2))
        );

        return newArray.concat(
            data2.filter(
                (item2) => !data.some((item1) => compareObjects(item1, item2))
            )
        );
    }
    const ketQua = removeSimilarElements(data, data2);
    //LỌC PHẦN TỬ LẶP LẠI 
    function compare(personA, personB) {
        return personA.idQLC === personB.idQLC && personA.shiftID === personB.shiftID;
        }
    
    let newData = functions.arrfil(ketQua, compare);
    // console.log(newData)

    const pageSize = 20;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = pageNumber * pageSize;
    const results = newData.slice(startIndex, endIndex);

    if (newData) {//lấy thành công danh sách NV 
        return await functions.success(res, 'Lấy thành công', { results, pageNumber });
    }
    return functions.setError(res, 'Không có dữ liệu', 404);
}

exports.getTrackingtime = async (req,res)=>{


    try {
        const pageNumber = req.body.pageNumber || 1;
        const request = req.body;
        let com_id = request.com_id,
            CreateAt = request.CreateAt || true
            inputNew = request.inputNew 
            inputOld = request.inputOld



        if((com_id && CreateAt && inputNew && inputOld )==undefined){
            functions.setError(res,"lack of input")
        }else if(isNaN(com_id)){
            functions.setError(res,"id must be a Number")
        }else{
            // const data = await Tracking.find({com_id: com_id, CreateAt: { $gte: '2023-06-01', $lte: '2023-06-06' } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
            const data = await Tracking.find({com_id: com_id, CreateAt: { $gte: inputOld , $lte: inputNew } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
            if (data) {
                return await functions.success(res, 'Lấy thành công', { data });
            };
            return functions.setError(res, 'Không có dữ liệu', 404);
        }
   

    } catch (err) {
        functions.setError(res, err.message);
    };


}
exports.getTrackingALLCondition = async (req,res)=>{


    try {
        const pageNumber = req.body.pageNumber || 1;
        const request = req.body;
        let idQLC = request.idQLC || null
            com_id = request.com_id,
            depID = request.depID || null
            CreateAt = request.CreateAt || true
            inputNew = request.inputNew || null
            inputOld = request.inputOld || null
            if((com_id && CreateAt )==undefined){
                functions.setError(res,"lack of input")
            }else if(isNaN(com_id)){
                functions.setError(res,"id must be a Number")
            }else{
                if(depID == undefined){// tìm kiếm theo tất cả lịch sử chấm công của cty   
                const data = await Tracking.find({com_id: com_id}).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ _id : -1});
                    if (data) {
                        return await functions.success(res, 'Lấy thành công', { data });
                    };
                    return functions.setError(res, 'Không có dữ liệu', 404);
                }else if(idQLC == undefined){//tìm kiếm lịch sử chấm công theo phòng ban 
                    const data0 = await Tracking.find({com_id: com_id, depID:depID}).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ _id : -1});
                    if (data0) {
                        return await functions.success(res, 'Lấy thành công', { data0 });
                    };
                    return functions.setError(res, 'Không có dữ liệu', 404);
                // // }else if(idQLC){//tìm kiếm theo tên nhân viên 
                // //     const data3 = await Tracking.find({com_id: com_id, idQLC : idQLC }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                // //     if (data3) {
                // //         return await functions.success(res, 'Lấy thành công', { data3 });
                // //     };
                // //     return functions.setError(res, 'Không có dữ liệu', 404);
                }else if((inputNew && inputOld )==undefined){//tìm kiếm theo tên nhân viên va phong ban
                    // const data = await Tracking.find({com_id: com_id, CreateAt: { $gte: '2023-06-01', $lte: '2023-06-06' } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                    const data1 = await Tracking.find({com_id: com_id,idQLC : idQLC ,depID:depID}).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                    if (data1) {
                        return await functions.success(res, 'Lấy thành công', { data1 });
                    };
                    return functions.setError(res, 'Không có dữ liệu', 404);
                // }else if(inputNew && inputOld ){//tìm kiếm theo tgian
                //     const data4 = await Tracking.find({com_id: com_id, CreateAt: { $gte: inputOld , $lte: inputNew } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                //     if (data4) {
                //         return await functions.success(res, 'Lấy thành công', { data4 });
                //     };
                //     return functions.setError(res, 'Không có dữ liệu', 404);
                }else{// tìm kiếm theo  tất cả điều kiện
                    // const data = await Tracking.find({com_id: com_id, CreateAt: { $gte: '2023-06-01', $lte: '2023-06-06' } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                    const data2 = await Tracking.find({com_id: com_id,idQLC : idQLC ,depID:depID, CreateAt: { $gte: inputOld , $lte: inputNew } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                    if (data2) {
                        return await functions.success(res, 'Lấy thành công', { data2 });
                    };
                    return functions.setError(res, 'Không có dữ liệu', 404);
                }}
                                // if(depID) {
                //     const data0 = await Tracking.find({com_id: com_id, depID:depID}).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                //     // console.log(data0)
                //       functions.success(res, 'Lấy thành công', { data0 });

                //     if(idQLC){
                //         const data01 = await Tracking.find({com_id: com_id, depID:depID, idQLC:idQLC}).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                //         // console.log(data01)
                //          functions.success(res, 'Lấy thành công', { data01 });

                //     }
                // } 
                // if(idQLC){
                //     const data1 = await Tracking.find({com_id: com_id,idQLC : idQLC}).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                //     // console.log(data1)
                //      functions.success(res, 'Lấy thành công', { data1 });

                //     if(inputNew && inputOld){
                //         const data11 = await Tracking.find({com_id: com_id,idQLC : idQLC, CreateAt: { $gte: inputOld , $lte: inputNew }}).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                //         // console.log(data11)
                //          functions.success(res, 'Lấy thành công', { data11 });

                //     }
                // }
                // if(inputNew && inputOld){
                //     const data2 = await Tracking.find({com_id: com_id,CreateAt: { $gte: inputOld , $lte: inputNew } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                //     // console.log(data2)
                //      functions.success(res, 'Lấy thành công', { data2 });

                //     if(depID){
                //         const data21 = await Tracking.find({com_id: com_id,CreateAt: { $gte: inputOld , $lte: inputNew } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
                //         // console.log(data21)
                //          functions.success(res, 'Lấy thành công', { data21 });
                //     }

    } catch (err) {
        functions.setError(res, err.message);
    };

 
}
exports.getTrackingALLConNotTime = async (req,res)=>{


    try {
        const pageNumber = req.body.pageNumber || 1;
        const request = req.body;
        let idQLC = request.idQLC || null
            com_id = request.com_id,
            depID = request.depID || null
            CreateAt = request.CreateAt || true
            inputNew = request.inputNew || null
            inputOld = request.inputOld || null
            let data = [];
            let listCondition = {};
        
            if((com_id)==undefined){
                functions.setError(res,"lack of input")
            }else if(isNaN(com_id)){
                functions.setError(res,"id must be a Number")
            }else{
            
            if(idQLC) listCondition.idQLC = idQLC;
            if(depID) listCondition.depID =  depID;
            if(inputNew) listCondition.inputNew = inputNew;
            if(inputOld) listCondition.inputOld = inputOld;
            // const data = await Tracking.find({com_id: com_id, CreateAt: { $gte: '2023-06-01', $lte: '2023-06-06' } }).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ CreateAt : -1});
             data = await Tracking.find(listCondition).select('_id idQLC Location CreateAt shiftID status  ').skip((pageNumber - 1) * 20).limit(20).sort({ _id : -1});
            if (data) {
                return await functions.success(res, 'Lấy thành công', { data });
            };
            return functions.setError(res, 'Không có dữ liệu', 404);
        }
   

    } catch (err) {
        functions.setError(res, err.message);
    };

 
}

