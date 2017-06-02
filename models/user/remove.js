'use strict';

const db = require('../../libs/db.js').get();
const Password = require('../schema.js').Password;
const ObjectId = require('mongodb').ObjectId;
const encryptPassword = require('./save.js').encryptPassword;

/**
 * Удаляет пользователя из системы.
 * @param {ObjectId} id ид документа, сгенерированый монго
 * @param {String} password пароль, пользователя
 *
 * Алгоритм:
 *   1. Валидация id и password
 *   2. Хеширование пароля
 *   3. Сопостовление пары id и password с парой хранящейся в БД
 *   и удаление или ошибка
 */
exports.remove = function remove(id, password, cb) {
  if (!id) {
    throw new Error('требуется id');
  }
  if (!password) {
    throw new Error('требуется password');
  }

  if (!ObjectId.isValid(id)) {
    return cb(new Error('id не валидный'));
  }
  const error = Password.validate({password: password});
  if(error.length) {
    return cb(error);
  }
  
  const hashedPassword = encryptPassword(password);
  
  const query = {
    $and: [
      { _id: id },
      { hashedPassword: hashedPassword }
    ]
  };
  
  db.users.findOneAndDelete(
    query,
    { projection: { _id: 1 } },
    function(err, r) {
      if (err) {
        return cb (err);
      }
      // r.value = null, если документ не найден
      // если найден, то r.velue = найденому документы
      if (r.value === null) {
        return cb(new Error('не правильный пароль'));
      } else {
        return cb(null);
      }
    }
  );

};