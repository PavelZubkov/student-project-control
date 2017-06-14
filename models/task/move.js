'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

module.exports = function move(projectId, taskId, position, cb) {
  return cb(null, null);
};