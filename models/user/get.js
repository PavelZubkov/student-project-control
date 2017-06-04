'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

/**
 * Получение данных пользователя
 *
 */
exports.get = function get(id, cb) {
  if (!ObjectId.isValid(id)) {
    return cb(new Error('id не валидный'));
  }
  id = new ObjectId(id);
  db.users.findOne(
    {
      _id: id
    },
    function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        return cb(new Error('нет такого пользователя'));
      }
      return cb(
        null,
        {
          username: doc.username,
          email: doc.email,
          firstName: doc.firstName,
          lastName: doc.lastName,
          initials: doc.initials,
          projects: doc.projects
        }
      );
    }
  );
};