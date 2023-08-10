/** @format */

const Project = require('../../models/qlcnew/project');
const fn = require('../../services/functions');
const Deparment = require('../../models/qlc/Deparment');
exports.create = async (req, res) => {
   try {
      let {name, dep_id, desc, members, timeStart, timeFinish, managers} = req.body;
      if (!name || !dep_id || !timeStart || !timeFinish || !members || !desc) return fn.setError(res, 'Missing input value!', 400);
      //kiểm tra xem có phòng ban này k
      // if (isNaN(dep_id)) {
      //    fn.setError(res, 'Id must be a number', 400);
      // } else {
      //    let depart = await Deparment.findById(dep_id);
      //    if (!depart) fn.setError(res, 'Deparment not found', 400);
      // }
      if (!fn.checkDate(timeStart) || !fn.checkDate(timeFinish)) return fn.setError(res, 'Invalid date', 400);
      if (new Date(timeStart) >= new Date(timeFinish)) {
         return fn.setError(res, 'Start time must be before finish time', 400);
      }
      // Lấy max id
      let maxId = await fn.getMaxID(Project);
      // thêm user hiện tại vào managers
      let userID = req.user.data._id;
      let managerSet = new Set();
      [userID, ...(managers ? managers : [])].forEach((manager) => {
         managerSet.add(manager);
      });
      const project = new Project({
         _id: Number(maxId) + 1 || 1,
         name: name,
         dep_id: dep_id,
         desc: desc,
         members: members,
         timeStart: timeStart,
         timeFinish: timeFinish,
         managers: [...managerSet],
      });
      await project
         .save()
         .then(() => {
            fn.success(res, 'Create Project successfully', {data: project._doc});
         })
         .catch((err) => {
            fn.setError(res, err.message, 400);
         });
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.delete = async (req, res) => {
   try {
      let _id = req.params.id;
      let doc = await Project.findByIdAndUpdate(
         _id,
         {
            is_deleted: true,
         },
         {new: true},
      );
      if (!doc) fn.setError(res, 'Project not found', 400);
      return fn.success(res, 'Successfully deleted Project');
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.edit = async (req, res) => {
   try {
      let {_id, name, dep_id, desc, timeStart, timeFinish, managers_add, managers_delete, members_add, members_delete} = req.body;
      if (isNaN(_id, dep_id)) {
         fn.setError(res, 'Id must be a number', 400);
      }

      //kiểm tra xem có phòng ban này k
      if (dep_id) {
         let depart = await Deparment.findById(dep_id);
         if (!depart) return fn.setError(res, 'Deparment not found', 400);
      }
      const project = req.project;

      // thêm manager
      let managerSet = new Set(project.managers);
      if (managers_add) {
         managers_add.forEach((manager) => {
            managerSet.add(manager);
         });
      }
      if (managers_delete) {
         managers_delete.forEach((manager) => {
            managerSet.delete(manager);
         });
      }
      // thêm member
      let memberSet = new Set(project.members);
      if (members_add) {
         members_add.forEach((member) => {
            memberSet.add(member);
         });
      }
      if (members_delete) {
         members_delete.forEach((member) => {
            memberSet.delete(member);
         });
      }
      // validate time
      timeStart = timeStart ? timeStart : project.timeStart;
      timeFinish = timeFinish ? timeFinish : project.timeFinish;
      if (new Date(timeStart) >= new Date(timeFinish)) {
         return fn.setError(res, 'Start time must be before finish time', 400);
      }
      let doc = await Project.findByIdAndUpdate(
         _id,
         {
            name: name,
            dep_id: dep_id,
            desc: desc,
            members: members_add || members_delete ? [...memberSet] : undefined,
            timeStart: timeStart,
            timeFinish: timeFinish,
            managers: managers_add || managers_delete ? [...managerSet] : undefined,
         },
         {new: true},
      );
      if (!doc) fn.setError(res, 'Project not found', 400);
      return fn.success(res, 'Project edited successfully', {data: doc});
   } catch (error) {
      return fn.setError(res, error.message);
   }
};

exports.addWorkForEmployee = async (req, res) => {
   try {
      const {_id, use_id, desc, time_start, time_finish} = req.body;
      if (!use_id || !desc || !time_start || !time_finish) return fn.setError(res, 'Missing input value!', 400);
      if (isNaN(_id, use_id)) {
         fn.setError(res, 'Id must be a number', 400);
      }
      //validate time
      if (!fn.checkDate(time_start) || !fn.checkDate(time_finish)) return fn.setError(res, 'Invalid date', 400);
      if (new Date(time_start) >= new Date(time_finish)) {
         return fn.setError(res, 'Start time must be before finish time', 400);
      }
      const project = req.project;

      //kiểm tra xem thành viên có thuộc dự án k
      let employ = project.members.includes(use_id);
      if (!employ) {
         return fn.setError(res, 'Thành viên không thuộc dự án ', 403);
      }
      const newWork = await Project.findByIdAndUpdate(
         _id,
         {
            $push: {
               works: {
                  use_id: use_id,
                  time_start: time_start,
                  time_finish: time_finish,
                  desc: desc,
               },
            },
         },
         {new: true},
      );
      if (!newWork) fn.setError(res, 'Project not found', 400);
      return fn.success(res, 'Successfully added  Projectwork', {data: newWork});
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.editWorkForEmployee = async (req, res) => {
   try {
      const {_id, work_id, use_id, time_start, time_finish, desc} = req.body;
      if (!work_id || !use_id) return fn.setError(res, 'Missing input value!', 400);
      if (isNaN(_id, use_id)) {
         fn.setError(res, 'Id must be a number', 400);
      }
      const project = req.project;
      //validate time
      time_start = time_start ? time_start : project.time_start;
      time_finish = time_finish ? time_finish : project.time_finish;
      if (new Date(time_start) >= new Date(time_finish)) {
         return fn.setError(res, 'Start time must be before finish time', 400);
      }
      const work = await Project.updateOne(
         {_id, 'works._id': work_id},
         {
            $set: {
               'works.$.use_id': use_id,
               'works.$.time_start': time_start,
               'works.$.time_finish': time_finish,
               'works.$.desc': desc,
            },
         },
         {new: true},
      );
      if (!work) fn.setError(res, 'Project not found', 400);
      return fn.success(res, 'Successfully edited Projectwork', {data: await Project.findById(_id)});
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.deleteWorkForEmployee = async (req, res) => {
   try {
      const {work_id} = req.body;
      if (!work_id) return fn.setError(res, 'Missing input value!', 400);
      const _id = req.params.id;
      const work = await Project.updateOne(
         {_id, 'works._id': work_id},
         {
            $set: {
               'works.$.is_deleted_work': true,
            },
         },
         {new: true},
      );
      if (!work) fn.setError(res, 'Project not found', 400);
      return fn.success(res, 'Successfully deleted Projectwork');
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.getProject = async (req, res) => {
   try {
      const _id = req.params.id;
      const project = await Project.findById(_id, {is_deleted: false});

      if (!project) {
         return fn.setError(res, 'Project not found', 400);
      }

      return fn.success(res, 'Successfully retrieved project', {data: project});
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
exports.getAllProject = async (req, res) => {
   try {
      const projects = await Project.find({is_deleted: false});
      if (projects.length === 0) return fn.setError(res, 'Không có dữ liệu', 400);
      return fn.success(res, 'Successfully retrieved all projects', {data: projects});
   } catch (error) {
      return fn.setError(res, error.message);
   }
};
