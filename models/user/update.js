'use strict';

const db = require('../../libs/db.js').get();
const encryptPassword = require('./save.js').encryptPassword;
const checkDB = require('./save.js').checkDB;
const User = require('../schema.js').requiredOffUser;
const log = require('../../libs/log.js')(module);

const checkIdAndPassword =  function checkIdAndPassword(id, hashedPassword, cb) {
  const query = {
    $and: [
      { _id: id },
      { hashedPassword: hashedPassword }
    ]
  };
  
  db.users.findOne(
    query,
    function(err, r) {
      if (err) {
        return cb (err);
      }
      // r = null, если документ не найден
      // если найден, то r.value = найденому документы
      if (r === null) {
        return cb(new Error('не правильный пароль'));
      } else {
        return cb(null);
      }
    }
  );
};
/**
 * Подготавливает новый пароль
 *
 */
const preparePassword = function preparePassword(user) {
  const hashedPassword = encryptPassword(user.newPassword);
  delete user.oldPassword;
  delete user.newPassword;
  user.hashedPassword = hashedPassword;
  return user;
};
/**
 * Сверяет oldPassword с паролем хранящимся в БД
 *
 */
const checkPassword = function checkPassword(id, user, cb) {
  if (user.oldPassword === undefined) {
    return cb(null);
  }
  const hashedOldPassword = encryptPassword(user.oldPassword);
  
  checkIdAndPassword(id, hashedOldPassword, function(err) {
    if (err) {
      return cb(err);
    }
    user = preparePassword(user);
    return cb(null, user);
  });
};
/**
 * Проверяет поля
 *
 */
const validate = function validate(user) {
  const error = User.validate(user);
  if (error.length) {
    return error[0]; // Пусть будет одна ошибка, что бы instanceof Error проверить и все
  }
  
  if (user.oldPassword !== undefined && user.newPassword === undefined) {
    return new Error('требуется новый пароль');
  }
  
  const _user = {}, props = ['username', 'email', 'firstName', 'lastName', 'initials', 'oldPassword', 'newPassword'];
  for (let prop of props) {
    if (user[prop] !== undefined) {
      _user[prop] = user[prop];
    }
  }
  return _user;
};
exports.validate = validate;
/**
 * Обновляет одно или несколько полей данных пользователя:
 *  username, email, oldPassword, newPassword, firstName, lastName, initials
 * 
 * Алгоритм:
 *  1. Валидация входных данных
 *  2. Проверка на уникальность нового username или email, если они присутствуют
 *  3. проверка старого пароля, хеширование пароля, если присутствует
 *  4. обновление документа в БД
 *
 * @param {Object} user объект пользователя с новыми данными
 * @param {String} password старый пароль, null, если в объекте user не поля password
 * @param {Function} cb колбек
 */
exports.update = function update(user, cb) {
  if (user.id === undefined) {
    throw new Error('кто-то забыл передать id');
  }
  const id = user.id;
  const _user = validate(user);
  if (_user instanceof Error) {
    return cb(_user);
  }
  checkDB(_user, function(err) {
    if (err) {
      return cb(err);
    }
    checkPassword(id, _user, function(err, user) {
      if (err) {
        return cb(err);
      }
      let usr = _user;
      if (user !== undefined) {
        usr = user;
      }
      db.users.findOneAndUpdate(
        { _id: id },
        { $set: usr },
        function(err, r) {
          if (err) {
            return cb(err);
          }
          // r.value = null, если документ не найден
          // если найден, то r.value = найденому документы
          if (r.value === null) {
            // документ не был найден - не обновлен или еще что-то
            // может в бд нет пользователя с переданным id 
            return cb(new Error('этот пользователь не существует'));
          }
          // все ок
          return cb(null);
        }
      );
    });
  });
};