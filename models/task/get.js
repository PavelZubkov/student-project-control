'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

module.exports = function get(projectId, taskId, cb) {
  if (!ObjectId.isValid(projectId)) {
    return cb(new Error('projectId должен иметь тип ObjectId'));
  }

  if (!ObjectId.isValid(taskId)) {
    return cb(new Error('taskId должен иметь тип ObjectId'));
  }

  projectId = new ObjectId(projectId);
  taskId = new ObjectId(taskId);

  const query = {
    _id: projectId,
    'tasks.id': taskId
  };
  db.projects.findOne(
    query, {
      fields: {
        'tasks.$': 1
      }
    }, function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        return cb(new Error('Задачи с таким id в массиве нет'));
      }
      return cb(null, doc.tasks[0]);
    }
  );
};
