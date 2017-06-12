'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;
const validate = require('./validate');

module.exports = function create(projectId, name, cb) {
  if (!ObjectId.isValid(projectId)) {
    throw new Error('ProjectId должен иметь тип ObjectId');
  }
  projectId = new ObjectId(projectId);
  
  const error = validate({ name: name }, ['name']);
  if (error) {
    return cb(error);
  }
  
  const query = {
    _id: projectId
  };
  const update = {
    $push: {
      tasks: {
        id: new ObjectId(),
        name: name,
        description: '',
        members: [],
        dueDate: null,
        state: 'Черновик'
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
      if (!r.value) {
        return cb(new Error('Проект с таким id не найден'));
      }
      return cb(null);
    }
  );
};