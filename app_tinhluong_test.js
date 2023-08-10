/** @format */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
// var logger = require('morgan');
var mongoose = require('mongoose');
const formData = require('express-form-data');
const jwt = require('jsonwebtoken');
require('dotenv').config();
var AppVanthu = express();
// var AppCRM = express();
var AppQLC = express();
var AppQLCNew = express();
// var AppHR = express();
var AppTinhluong = express();

function configureApp(app) {
   app.set('views', path.join(__dirname, 'views'));
   app.set('view engine', 'jade');
   // app.use(logger('dev'));
   app.use(express.json());
   app.use(express.urlencoded({extended: false}));
   app.use(cookieParser());
   app.use(express.static('/root/app/storage'));
   app.use(cors());

   app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
   });
}

function errorApp(app) {
   // catch 404 and forward to error handler
   app.use(function (req, res, next) {
      next(createError(404));
   });

   // error handler
   app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
   });
}

// process.env.NODE_SERCET
// export const checkToken = async (token) => {
//     try{
//         let user = await jwt.verify(token, tokenPassword() );
//         console.log('user token',user);
//         if(user.UnCheckExpired){
//             console.log('user UnCheckExpired');
//             return {
//                 userId:user._id,
//                 status:true
//             }
//         }
//         if(new Date(user.timeExpried) > new Date()){
//             return {
//                 userId:user._id,
//                 status:true
//             }
//         }
//         else{
//             return {
//                 userId:"",
//                 status:false
//             }
//         }

//     }
//     catch(e){
//         console.log(e);
//         return {
//             userId:"",
//             status:false
//         }
//     }
//   };
// Cấu hình appTimviec
// configureApp(AppTimviec);
// var timviecRouter = require('./routes/timviec');
// var toolAddDataRouter = require('./routes/tools');
// var dataRouter = require('./routes/data');

// AppTimviec.use("/api/timviec", timviecRouter);
// AppTimviec.use('/api/tool', toolAddDataRouter);
// AppTimviec.use('/api/getData', dataRouter);
// errorApp(AppTimviec)

// // Cấu hình AppRaonhanh
// configureApp(AppRaonhanh);
// var raonhanhRouter = require('./routes/raonhanh');
// var raonhanhtool = require('./routes/raonhanh365/tools');
// AppRaonhanh.use("/api/raonhanh", raonhanhRouter);
// AppRaonhanh.use("/api/tool", raonhanhtool);
// errorApp(AppRaonhanh);

// Cấu hình AppVanthu
configureApp(AppVanthu);
var vanthuRouter = require('./routes/vanthu');
AppVanthu.use('/api/vanthu', vanthuRouter);
errorApp(AppVanthu);

// Cấu hình AppQLC
configureApp(AppQLC);
var qlcRouter = require('./routes/qlc');
AppQLC.use('/api/qlc', qlcRouter);
errorApp(AppQLC);

// // Cấu hình AppHR
// configureApp(AppHR);
// var hrRouter = require('./routes/hr');
// AppHR.use("/api/hr", hrRouter);
// errorApp(AppHR);

// // Cấu hình AppCRM
// configureApp(AppCRM);
// var CrmRouter = require('./routes/crm');
// AppCRM.use("/api/crm", CrmRouter);
// errorApp(AppCRM);

// Cấu hình AppTinhluongs

configureApp(AppQLCNew);
var qlcNewRouter = require('./routes/qlcnew');
AppQLCNew.use(formData.parse());
AppQLCNew.use('/api/qlcnew', qlcNewRouter);
errorApp(AppQLCNew);

configureApp(AppTinhluong);
var tinhluongRouter = require('./routes/tinhluong');
const arrayInject = ['UNION', 'CASE', 'echo', ';', '$', '"', 'script', 'drop', 'SELECT', 'timviec365_tbtimviec', '=', 'delete', '*'];
const untiInjection = (body) => {
   const props = Object.getOwnPropertyNames(body);
   for (let i = 0; i < props.length; i++) {
      let data = String(body[props[i]]);
      for (let j = 0; j < arrayInject.length; j++) {
         if (data.includes(arrayInject[j])) {
            return false;
         }
      }
   }
   return true;
};
async function checkAuth(req, res, next) {
   try {
      if (req.body.token) {
         let user = await jwt.verify(req.body.token, process.env.NODE_SERCET);
         if (user && user.data && user.data._id) {
            if (new Date(1000 * Number(user.exp)) > new Date()) {
               req.userEnCoded = user;
               if (untiInjection(req.body)) {
                  if (next) next();
               } else {
                  return res.status(500).json({error: 'Spam'});
               }
            } else {
               return res.status(500).json({error: 'Expired'});
            }
         } else {
            return res.status(500).json({error: 'You are not authorized'});
         }
      } else {
         return res.status(500).json({error: 'You are not authorized'});
      }
   } catch (e) {
      return res.status(500).json({error: 'You are not authorized'});
   }
}
AppTinhluong.use(formData.parse());
AppTinhluong.use(checkAuth);
AppTinhluong.use('/api/tinhluong', tinhluongRouter);
errorApp(AppTinhluong);

const DB_URL = 'mongodb://localhost:27017/api-base365';
mongoose
   .connect(DB_URL)
   .then(() => console.log('DB Connected!'))
   .catch((error) => console.log('DB connection error:', error.message));

// Quản lý chung
AppQLC.listen(3003, () => {
   console.log(`QLC app is running on port 3000`);
});

// AppTimviec.listen(3001, () => {
//     console.log("Timviec365 app is running on port 3001")
// });

// // Raonhanh
// AppRaonhanh.listen(3004, () => {
//     console.log(`Raonhanh app is running on port 3004`);
// });

// Van thu
AppVanthu.listen(4001, () => {
   console.log(`Vanthu app is running on port 4001`);
});

// // Quản trị nhân sự
// AppHR.listen(3006, () => {
//     console.log(`HR app is running on port 3006`);
// });

// // Quản trị crm
// AppCRM.listen(3007, () => {
//     console.log(`CRM app is running on port 3007`);
// });

// Quản lý chung new
AppQLCNew.listen(3008, () => {
   console.log(`QLCNew app is running on port 3008`);
});

// Tính lương
AppTinhluong.listen(3009, () => {
   console.log(`Tinh luong app is running on port 3009`);
});
