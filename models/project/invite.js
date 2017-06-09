/**
 * Добавляет пользователя в проект, по email адресу
 *
 * !Все решения приняты из соображений "написать как можно быстрее(в будущем перепишу нормально)"
 * !Все "сообщения приглашающему" выглядят как выброс ошибки express'ом, сообственно так оно и есть - т.к. писать свой обработчик ошибок сейчас не буду
 * 
 * Варианты развития событий:
 *  * Адрес введен некорректно
 *    => сообщить приглашающему, что адрес введен не корректно
 *  * Пользователь с таким адресом не зарегистрирован 
 *    => сообщить приглашающему, что пусть сначала зарегистрируется(в будущем отправлять письмо на указаный адрес)
 *  * Пользователь с такми адресом зарегистрирован и состоит в этом проекте
 *    => сообщить приглашающему, что пользователь уже состоит в проекте
 *  * Пользователь с таким адресом зарегистрирован и не состоит в этом проекте 
 *    => не спрашивая внести его в этот проект(в будущем начать спрашивать - вступать или нет)
 * 
 * Касаемо БД:
 *  1. В поле projects документа пользователя нужно добавить указатель на этот проект
 *     В поле team документа проекта нужно добавить указатель на пользователя
 *  
 *  2. Проверка регистрации этого email + если зарегистрирован сразу проверить полу projects  - 1-й запрос к коллекции users
 *     Проверка присутствия этого email в этом проекте - 2 запрос к коллекции projects, но он уже сделан - при каждом обращении данные текущего проекта загружаются в res.locals.project - поэтому взять оттуда(надеюсь экспресс или драйвер монго их кэширует) - но логика ядра окажется в роуте - поэтому сделаю 2-й запрос отсюда.
 *    т.е. 2 запроса на проверки + 2 запроса на изменение коллекций users и projects.
 *    findAndModify не подходит, насколько я понимаю?
 *    делаю 4 - запроса
 *  
 */
 'use strict';

const db = require('../../libs/db.js').get();
const User = require('../schema.js').requiredOffUser; //User.validate({ email: 'email@email' })
const ObjectId = require('mongodb').ObjectId;

/**
 * bad
 * Добавляет пользователья в проект, а проект в пользователя
 *
 */
const addUser = function addUser(projectId, userId, cb) {
  const query = {
    _id: userId
  };
  const update = {
    $push: {
      projects: projectId
    }
  };
  db.users.findOneAndUpdate(
    query,
    update,
    function(err, r) {
      if (err) {
        return cb(err);
      }
      // if (!r.ok) {
      //   return 
      // }
      db.projects.findOneAndUpdate(
        {
          _id: projectId
        },
        {
          $push: {
            team: userId
          }
        },
        function(err, r) {
          if (err) {
            return cb(err);
          }
          return cb(null);
        }
      );
    }
  );
};
/**
 * Проверяет состоит ли пользователь userId в проекте projectId
 *  если да - cb(new Error(пользователь уже в проекте))
 *
 */
const includedInProject = function includedInProject(projectId, userId, cb) {
  db.projects.findOne(
    {
      $and: [
        { _id: projectId },
        { team: userId }
      ]
    },
    function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (doc) {
        return cb(new Error('пользователь уже состоит в этом проекте'));
      }
      return cb(null);
    }
  );
};
/**
 * Проверяет, есть ли пользователь с таким email,
 *  возвращает id этого пользователя
 *
 */
const checkEmail = function checkEmail(email, cb) {
  db.users.findOne(
    {
      email: email
    },
    function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        return cb(new Error('нет пользователя с таким email'));
      }
      return cb(null, doc._id);
    }
  );
};
/**
 * Добавляет пользователя в проект, по email адресу
 * @param {ObjectId} id ид проекта, в который добавляется пользователь
 * @param {String} email почта
 * @param {Function} cb колбек
 *
 * Алгоритм:
 *  1. Валидация id
 *  2. Валидация email
 *  3. Проверка - зарегестрирован пользователь с такой почтой в системе?
 *  4. Проверка - этот пользователь присутствует в этом проекте?
 *  5. Добавление пользователя в проект, добавление проекта в пользователя
 */
exports.invite = function invite(id, email, cb) {
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
      if (err) {
        return cb(err); // Пользователь уже в проекте
      }
      addUser(projectId, userId, function(err) {
        if (err) {
          return cb(err);
        }
        return cb(null);
      });
    });
  });
 };