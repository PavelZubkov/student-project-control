'use strict';

const db = require('../../libs/db.js').get();
const crypto = require('crypto');
const User = require('../schema.js').User;

/**
* Хеширует пароль
*/
const encryptPassword = function encryptPassword(password) {
  // const salt = Math.random() + '';
  const salt = 'salt:(';
  const hashedPassword = crypto.createHmac('sha1', salt).update(password).digest('hex');
  return hashedPassword;
}
exports.encryptPassword = encryptPassword;
/**
* Добавляет недостающие поля поля
*/
const prepare = function prepare(user) {
  user.initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
  user.projects = [];
  user.hashedPassword = encryptPassword(user.password);
  delete user.password;
  return user;
}
/**
 * Проверят username и email на доступность
 * @param  {Object}   user
 * @param  {Function} callback
 */
const checkDB = function checkDB(user, cb) {
  const query = {
    $or: []
  };
  if (user.username !== undefined) {
    query.$or.push( { username: user.username } );
  }
  if (user.email !== undefined) {
    query.$or.push( { email: user.email } );
  }
  if (user.username === undefined && user.email === undefined) {
    return cb(null);
  }
  
  const cursor = db.users.find(query);
  const errors = [];
  cursor.toArray(function(err, docs) {
    if (err) {
      return cb(err);
    }
    for (let doc of docs) {
      if (doc.username === user.username) {
        errors.push(new Error(`username "${doc.username}" уже занят`));
      }
      if (doc.email === user.email) {
        errors.push(new Error(`email "${doc.email}" уже занят`));
      }
    }
    if (errors.length) {
      return cb(errors);
    } else {
      return cb(null);
    }
  });
};
exports.checkDB = checkDB;
/**
 * Сохраняет пользователя в БД.
 *  1. Проверяет валидность данных нового пользователя.
 *  2. Проверяет занятость имени учетной записи пользователя и емейла
 *  3. Добавляет недостающие поля.
 *  4. Вставляет запись в БД. 
 *
 *  Проверки можно средствами монго реализовать. Другую БД будет сложнее подключить. И я не знаю как.
 * 
 * Описание полей в README
 * 
 * @param  {Object}   user Объект с данными о новом пользователе, содержит поля:
 *                         username, 
 *                         password,
 *                         email,
 *                         firstName ,
 *                         lastName.
 * @param {Function} cb колбек
 * Если функция выполнена успешно, вызывает колбек с параметрами null и идом вставленого документа: cb(null, _id)
 * иначе вызывает колбек с ощибкой: cb(err)
 */
exports.save = function save(user, cb) {
  if (!user) {
    throw new Error('требуется user');
  }
  if (!cb) {
    throw new Error('требуется callback')
  }

  const errors = User.validate(user); // Массив объектов ошибки
  if (errors.length) {
    return cb(errors);
  }

  checkDB(user, function(err) {
    if (err) {
      return cb(err);
    }

    user = prepare(user);
    

    db.users.insertOne(
      user,
      function(err, result) {
        if (err) {
          return cb(err);
        }
        if (result.insertedCount !== 1) {
          return cb(new Error('Документ не вставлен'));
        }
        cb(null, result.insertedId);
      }
    );
  });
}