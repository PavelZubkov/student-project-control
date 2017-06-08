'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

/**
 * Вовзращает массив объектов содержащий name и id, проектов пользователя
 * [ { name: ... , id: ... }, ...  ]
 */
exports.get = function get(userId, cb) {
  userId = new ObjectId(userId);
  
  const query = {
    team: userId
  };
  const cursor = db.projects.find(query);
  cursor.toArray(function(err, docs) {
    if (err) {
      return cb(err);
    }
    if (!docs.length) {
      return cb(null, []);
    }
    const projects = [];
    for (let doc of docs) {
      projects.push(
        {
          id: doc._id,
          name: doc.name,
        }
      );
    }
    return cb(null, projects);
  });
};