'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

/**
 * В массив members вместо idб подставляет данные пользователей
 *
 */
const expandMembers = function expandMembers(task, cb) {
  if (!task.members.length) {
    return cb(null, task);
  }
  const query = {
    $or: []
  };
  for (let member of task.members) {
    query.$or.push({
      _id: member
    });
  }
  const members = [];
  const cursor = db.users.find(query);
  cursor.toArray(function(err, users) {
    if (err) {
      return cb(err);
    }
    if (!users.length) {
      return cb(null, task);// ЧТО?
    }
    for (let user of users) {
      delete user.hashedPassword;
      members.push(user);
    }
    task.members = members;
    return cb(null, task);
  });
};
/**
 * Возвращает данные задачи по ее id из проекта projectId
 *
 */
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
      // return cb(null, doc.tasks[0]);
      return expandMembers(doc.tasks[0], cb);
    }
  );
};
