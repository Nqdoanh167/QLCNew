/** @format */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema(
   {
      _id: {
         type: Number,
      },
      name: {
         type: String,
         default: '',
      },
      dep_id: {
         type: Number,
      },
      timeStart: {
         type: Date,
         default: Date.now,
      },
      timeFinish: {
         type: Date,
         default: null,
      },
      desc: {
         type: String,
         default: '',
      },
      managers: [
         {
            type: Number,
         },
      ],
      members: [
         {
            type: Number,
         },
      ],
      is_deleted: {
         type: Boolean,
         default: false,
      },

      works: {
         type: [
            {
               use_id: {
                  type: Number,
               },
               desc: {
                  type: String,
               },
               time_start: {
                  type: Date,
                  default: null,
               },
               time_finish: {
                  type: Date,
                  default: null,
               },
               is_deleted: {
                  type: Boolean,
                  default: false,
               },
            },
         ],
      },
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model('Project', projectSchema);
