'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;
const get = require('./get.js');

// Получить данные задачи id
// Создать задачу с таким же названием
// Обновить данные созданной задачи
module.exports = function copy(projectId, taskId, cb) {
  if (!ObjectId.isValid(projectId)) {
    return cb(new Error('projectId должен иметь тип ObjectId'));
  }

  if (!ObjectId.isValid(taskId)) {
    return cb(new Error('taskId должен иметь тип ObjectId'));
  }

  projectId = new ObjectId(projectId);
  taskId = new ObjectId(taskId);
  
  get(projectId, taskId, function(err, task) {
    if (err) {
      return cb(err);
    }
    const query = {
    _id: projectId
    };
    const update = {
      $push: {
        tasks: {
          id: new ObjectId(),
          name: 'Копия ' + task.name,
          description: task.description,
          members: task.members,
          dueDate: task.dueDate,
          state: task.state
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
  });
};