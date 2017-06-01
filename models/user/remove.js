'use strict';

const db = require('../../libs/db.js').get();
const crypto = require('crypto');
const Password = require('../schema.js').Password;
const ObjectID = require('mongodb').ObjectID;

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
  const error = Password.validate(password);
  if(error) {
    return cb(error);
  }

};