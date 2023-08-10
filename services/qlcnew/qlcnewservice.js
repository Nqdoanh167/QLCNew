/** @format */

const PermissionUser = require('../../models/hr/PermisionUser');

exports.checkRole = async (infoLogin, barId, perId) => {
   if (infoLogin.type == 1) return true;
   let permission = await PermissionUser.findOne({userId: infoLogin.id, barId: barId, perId: perId});
   // console.log(permission);
   if (permission) return true;
   return false;
};

exports.checkRoleUser = (req, res, next) => {
   try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
         return res.status(401).json({message: 'Missing token'});
      }
      jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
         if (err) {
            return res.status(403).json({message: 'Invalid token'});
         }
         // console.log(user.data);
         var infoLogin = {type: user.data.type, id: user.data.idQLC, name: user.data.userName};
         if (user.data.type != 1) {
            if (user.data.inForPerson && user.data.inForPerson.employee && user.data.inForPerson.employee.com_id) {
               infoLogin.comId = user.data.inForPerson.employee.com_id;
            } else {
               return res.status(404).json({message: 'Missing info inForPerson!'});
            }
         } else {
            infoLogin.comId = user.data.idQLC;
         }
         req.infoLogin = infoLogin;
         next();
      });
   } catch (err) {
      console.log(err);
      return res.status(503).json({message: 'Error from server!'});
   }
};

exports.checkRight = (barId, perId) => {
   return async (req, res, next) => {
      let infoLogin = req.infoLogin;

      if (infoLogin.type == 1) return next();
      let permission = await PermissionUser.findOne({userId: infoLogin.id, barId: barId, perId: perId});
      if (permission) return next();
      return functions.setError(res, 'no right', 444);
   };
};
