'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;
const create = require('./create.js').create;

/**
 * Копирует проект, подробности в хаке функции create :()
 *
 */
exports.copy = function copy(projectId, cb) {
  const id = new ObjectId(projectId);
  db.projects.findOne(
    { _id: id },
    function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        return cb(new Error('Такого проекта нет'));
      }
      create(doc.name, doc.team[0], function(err, id) {
        if (err) {
          return cb(err);
        }
        return cb(null);
      }, doc);
    }
  );
};