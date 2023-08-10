const axios = require('axios');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
let TakeDataContract = async()=>{
    try{
        console.log('Bắt đấu');
        for(let i=0; i<1000; i++){
            let response = await axios({
                method: "post",
                url: "http://210.245.108.201:9003/api/image/GenImage",
                data: {
                    link:`https://timviec365.vn/cv365/site/xem_cv_nodejs/1989/587759`
                },
                headers: { "Content-Type": "multipart/form-data" }
            });
            if(response.data){
               console.log(response.data);
               console.log('Ok',i);
               console.log(new Date());
            }
        }
    }
    catch(e){
        console.log(e,'TakeDataTimeSheet')
    }
}
TakeDataContract()