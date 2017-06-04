'use strict';

const db = require('../../libs/db.js').get();
const User = require('../schema.js').requiredOffUser;
const encryptPassword = require('./save.js').encryptPassword;

/**
 * Авторизация
 *
 */
exports.auth = function auth(username, password, cb) {
  const errors = User.validate( { username: username, password: password } );
  if (errors.length) {
    return cb(errors[0]);
  }
  db.users.findOne(
    {
      username: username
    },
    function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        return cb(new Error('неверный username'));
      } else if (doc.hashedPassword !== encryptPassword(password)) {
        return cb(new Error('неверный password'));
      } else {
        return cb(null, doc._id);
      }
    }
  );
};