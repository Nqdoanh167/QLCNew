/** @format */
const fn = require('../../services/functions');
const Project = require('../../models/qlcnew/project');

exports.checkPermission = async (req, res, next) => {
   let _id = req.params.id ? req.params.id : req.body._id;
   if (!_id) return fn.setError(res, 'Invalid projectId', 400);
   let project = await Project.findById(_id);
   if (!project) {
      return fn.setError(res, 'Project not found', 404);
   }
   let requestingUserIsManager = project.managers.includes(req.user.data._id);
   if (!requestingUserIsManager) {
      return fn.setError(res, 'You are not authorized ', 403);
   }
   req.project = project;
   next();
};
