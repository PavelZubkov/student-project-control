'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

module.exports = function remove(projectId, taskId, cb) {
  if (!ObjectId.isValid(projectId)) {
    return cb(new Error('projectId должен иметь тип ObjectId'));
  }
  
    if (!ObjectId.isValid(taskId)) {
    return cb(new Error('taskId должен иметь тип ObjectId'));
  }
  
  projectId = new ObjectId(projectId);
  taskId = new ObjectId(taskId);
  const query = {
    _id: projectId
  };
  const update = {
    $pull: {
      'tasks': {
        id: taskId
      }
    }
  };
  db.projects.findOneAndUpdate(
    query,
    update,
    function(err, r) {
      if (err) {
        return cb(err);
      }
      return cb(null);
    }
  );
  
};