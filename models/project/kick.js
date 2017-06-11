/**
 * Весь модуль - обертка над invite.js
 *
 */
'use strict';

const db = require('../../libs/db.js').get();
const User = require('../schema.js').requiredOffUser; //User.validate({ email: 'email@email' })
const ObjectId = require('mongodb').ObjectId;
const checkEmail = require('./invite.js').checkEmail;
const includedInProject = require('./invite.js').includedInProject; 
const changeUser = require('./invite.js').changeUser;

/**
 * исключает пользователя из проекта
 *
 */
const kickUser = function kickUser(projectId, userId, cb) {
  changeUser(projectId, userId, function(err) {
    if (err) {
      return cb(err);
    }
    return cb(null);
  }, true);
};
/**
 * Исключает пользователя из проекта(user.projects, project.team - два места)
 *
 * алгортим:
 *  1. валидация email, id
 *  2. проверка - пользователь с такой почтой зарегистрирован в системе?
 *  3. проверка - пользователь входит в проект из которого его исключают?
 *  4. удаление у пользователя проекта - из user.projects
 *  5. удаление пользователя у проекта - из project.team
 */
exports.kick = function kick(id, email, cb) {
  if (!ObjectId.isValid(id)) {
    throw new Error('id проекта не валиден'); // Ошибка программиста, поэтому throw
  }
  const projectId = new ObjectId(id);
  
  const err = User.validate({ email: email });
  if (err.length) {
    return cb(err[0]);
  }
  
  checkEmail(email, function(err, userId) {
    if (err) {
      return cb(err);
    }
    includedInProject(projectId, userId, function(err) {
      // функция inckudedInProject возвращает ошибку елси пользователь в проекте
      // я ее использую, что бы убедиться, что пользователь в проекте
      if (!err) {
        return cb(new Error('пользователь с таким email не состоит в проекте'));
      } else if (err.message !== 'пользователь уже состоит в этом проекте') {
        return cb(err);
      } else {
        kickUser(projectId, userId, function(err) {
          if (err) {
            return cb(err);
          }
          return cb(null);
        });
      }
    });
  });
};