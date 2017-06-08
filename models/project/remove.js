'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

exports.remove = function(projectId, cb) {
  const id = new ObjectId(projectId);
  db.projects.deleteOne(
    {
      _id: id
    },
    function(err, r) {
      if (err) {
        return cb(err);
      }
      if (r.deletedCount !== 1) {
        return cb(new Error('Проект не удален'));
      }
      return cb(null);
    }
  );
};