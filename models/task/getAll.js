'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

/**
 * Возвращает список всех задач проекта
 *
 */
module.exports = function getAll(projectId, cb) {
  if (!ObjectId.isValid(projectId)) {
    return cb(new Error('Некорректный ид проекта'));
  }
  projectId = new ObjectId(projectId);
  
  db.projects.findOne({
    _id: projectId
  }, function(err, doc) {
    if (err) {
      return cb(err);
    }
    if (!doc) {
      return cb(new Error('Проект отсутствует'));
    }
    
    const query = {
      $or: []
    };
    
    for (let task of doc.tasks) {
      if (task.members.length) {
        for (let member of task.members) {
          query.$or.push( { _id: new ObjectId(member) } ); // нужно подставить данные мемберов, вместо их идов
        }
      }
    }
    // console.log(query);
    // return;
    if (!query.$or.length) {
      return cb(null, doc.tasks);
    }
    const cursor = db.users.find(query);
    cursor.toArray(function(err, docs) {
      if (err) {
        return cb(err);
      }
      for (let user of docs) {
        for (let i = 0; i < doc.tasks.length; i++) {
          if (doc.tasks[i].members.length) {
            for (let j = 0;  j < doc.tasks[i].members.length; j++) {
              if (user._id.equals(doc.tasks[i].members[j])) {
                doc.tasks[i].members[j] = user;
              }
            }
          }
        }
      }
      return cb(null, doc.tasks);
    });
  });
};