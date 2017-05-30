// моя первая реализация функции save
"use strict";
const db = require('../libs/db.js').get();
const crypto = require('crypto');
const validator = require('validator');
const log = require('../libs/log.js')(module);

exports.create = create;

/**
 * @public
 * Создает нового пользователя.
 * @param  {Object}   user Объект с данными о новом пользователе, содержит поля:
 *                         username, 
 *                         password - не хешированный пароль, длина [6, 32] символов,
 *                         email,
 *                         firstName,
 *                         lastName.
 * @param  {Function} cb   Вызывает перед завершением функции create с параметрами:
 *                         err - {Error} или {null},
 *                         id {ObjectId} - _id пользователя в базе
 *                         
 * Алгоритм:
 *   1. Проверка аргументов на наличие и соответсвие заданным типам
 *   2. Проверка каждого поля объекта user на наличие и соответствие заданному типу и длине
 *   3. Проверка полей username, email на не занятость - их не должно быть в базе
 *   4. Генерация инициалов по первым буквам имени и фамилии
 *   5. Хеширование пароля
 *   6. Вставка нового пользователя в базу методом insertOne(doc, options, callback)
 *   7. Вызов коллбека с аргументами null и _id
 *   *. В случае ошибки вызов коллбека с аргументом - объектом ошибки.
 */
function create(user, cb) {
  // 1 Проверка аргументов на наличие и соответсвие заданным типам - генерация исключений
  if (typeof user === 'undefined') throw new Error('аргумент user не передан');
  if (typeof cb === 'undefined') throw new Error('аргумент cb не передан');
  if (typeof user !== 'object') throw new Error('аргумент user должен иметь тип "object"');
  if (typeof cb !== 'function') throw new Error('аргумент cb должен иметь тип "function"');
  // 2 Проверка каждого поля объекта user на наличие и соответствие заданному типу и длине
  createValidation(user, function(err) {
    if (err) { // Одно из значений введено не верно
      return cb(err);
    }
    // 3 Проверка полей username, email на не занятость - их не должно быть в базе
    createTestUnique(user, function(err) {
      if (err) { // Введенные username или email уже кем-то используются
        return cb(err);
      }
      // 4 Генерация инициалов по первым буквам имени и фамилии
      generateInitials(user, function(initials) {
        user.initials = initials.toUpperCase();
        // 5 Хеширование пароля
        encryptPassword(user.password, function(hashedPassword) {
          user.hashedPassword = hashedPassword;
          delete user.password;
          // 6 Вставка нового пользователя в базу методом insertOne(doc, options, callback)
          // 6.1 Получение коллекции users
          db.collection('users', function(err, users) {
            if (err) { // Произошла ошибка при обращении к коллекции
              return cb(err);
            }
            // 6.2 Добавление не добавленных свойств
            user.projects = [];
            user.dialogs = [];
            user.locked = false;
            // 6.3 Вставка нового пользователя в коллекцию users
            users.insertOne(user, function(err, result) {
              if (err) { // MongoDB вернула какую-то ошибку
                return cb(err);
              }
              if (result.insertedCount !== 1) {
                return cb(new Error('объект user не сохранен'));
              }
              // 7 Вызов коллбека с аргументами null и _id
              cb(null, result.insertedId);
            });
          });
        });
      });
    });
  });
}

/**
 * Проверяет свойства usename и email на не занятость
 * @param  {Object}   user [description]
 * @param  {Function} cb   [description]
 */
function createTestUnique(user, cb) {
  usernameTestUnique(user.username, function(err) {
    if (err) {
      return cb(err);
    }
    emailTestUnique(user.email, function(err) {
      if (err) {
        return cb(err);
      }
      cb(null);
    });
  });
}

/**
 * Удостоверяется, что значение свойства username не присутствует в БД
 * @param  {String}   username [description]
 * @param  {Function} cb       [description]
 *
 * !!! код функций usernameTsetUnique и emailTestUnique полностью дублируется
 */
function usernameTestUnique(username, cb) {
  db.collection('users', function(err, users) {
    if (err) { // Произошла ошибка при обращении к коллекции
      return cb(err);
    }
    const query = {
      "username": username
    };
    users.findOne(query, {
      fields: {
        _id: 1
      }
    }, function(err, res) {
      if (err) { // Произошла ошибка при запросе
        return cb(err);
      }
      if (res !== null) {
        return cb(new Error('значение свойства username уже используется'));
      }
      cb(null);
    });
  });
}

/**
 * Удостоверяется, что email свободен
 * @param  {String}   email [description]
 * @param  {Function} cb    [description]
 *
 * !!! код функций usernameTsetUnique и emailTestUnique полностью дублируется
 */
function emailTestUnique(email, cb) {
  db.collection('users', function(err, users) {
    if (err) { // Произошла ошибка при обращении к коллекции
      return cb(err);
    }
    const query = {
      "email": email
    };
    users.findOne(query, {
      fields: {
        _id: 1
      }
    }, function(err, res) {
      if (err) { // Произошла ошибка при запросе
        return cb(err);
      }
      if (res !== null) {
        return cb(new Error('значение свойства email уже используется'));
      }
      cb(null);
    });
  });
}

/**
 * Генерирует инициалы пользователя по первыйм буквам имени и фамилии
 * @param  {Object}   user [description]
 * @param  {Function} cb   [description]
 */
function generateInitials(user, cb) {
  cb(user.firstName[0] + user.lastName[0]);
}

// Запускает для каждого поля объекта user, функции осуществляющую его валидацию
function createValidation(user, cb) {
  usernameValidation(user.username, function(err) {
    if (err) { // username
      return cb(err);
    }
    passwordValidation(user.password, function(err) {
      if (err) { // password
        return cb(err);
      }
      emailValidation(user.email, function(err) {
        if (err) { // email
          return cb(err);
        }
        firstNameValidation(user.firstName, function(err) {
          if (err) { // firstName
            return cb(err);
          }
          lastNameValidation(user.lastName, function(err) {
            if (err) { // lastName
              return cb(err);
            }
            cb(null);
          });
        });
      });
    });
  });
}

/**
 * Удостоверяется в том, что свойство username имеет тип 'string' и длину
 * от 4 до 12 символов включительно, иначе вызывает колбек с ошибкой.
 * 
 * @param  {String(4-12)} username      Логин нового пользователя
 * @param  {Function}         cb        Колбек
 */
function usernameValidation(username, cb) {
  if (!username) {
    cb(new Error('свойство username не передано'));
  }
  if (typeof username !== 'string') {
    cb(new Error('свойство username должно иметь тип "string"'));
  }
  if (!validator.isLength(username, {
      min: 4,
      max: 12
    })) {
    cb(new Error('свойство username должно иметь длину от 4 до 12 символов включительно'));
  }
  cb(null);
}

/**
 * Удостоверяется в том, что свойство password имеет тип 'string' и длину
 * от 6 до 32 символов включительно
 
 * @param  {String(6-32)} password  Пароль нового пользователя
 * @param  {Function} cb            Колбек
 */
function passwordValidation(password, cb) {
  if (!password) {
    cb(new Error('свойство password не передано'));
  }
  if (typeof password !== 'string') {
    cb(new Error('свойство password должно иметь тип "string"'));
  }
  if (!validator.isLength(password, {
      min: 6,
      max: 32
    })) {
    cb(new Error('свойство password должно иметь длину от 6 до 32 символов включительно'));
  }
  cb(null);
}

/**
 * Удостоверяется в том, что свойство email имеет "правильный" формат
 * 
 * @param  {String}   email Адрес электронной почты пользователя
 * @param  {Function} cb    Колбек
 */
function emailValidation(email, cb) {
  if (!email) {
    cb(new Error('свойство email не передано'));
  }
  if (typeof email !== 'string') {
    cb(new Error('свойство email должно иметь тип "string"'));
  }
  if (!validator.isLength(email, {
      min: 5,
      max: 30
    })) {
    cb(new Error('свойство email должно иметь длину от 5 до 30 символов включительно'));
  }
  if (!validator.isEmail(email)) {
    cb(new Error('свойство email имеет не правильный формат'));
  }
  cb(null);
}

/**
 * Удостоверяется, что свойство firstName передано, имеет тип 'string', длину от 1 до 12 
 * @param  {String} fristName   Имя пользователя
 * @param  {Function} cb        Колбек
 */
function firstNameValidation(firstName, cb) {
  if (!firstName) {
    cb(new Error('свойство firstName не передано'));
  }
  if (typeof firstName !== 'string') {
    cb(new Error('свойство firstName должно иметь тип "string"'));
  }
  if (!validator.isLength(firstName, {
      min: 1,
      max: 12
    })) {
    cb(new Error('свойство firstName должно иметь длину не превышающую 12 символов'));
  }
  cb(null);
}

/**
 * Удостоверяется, что свойство lastName передано, имеет тип 'string', длину от 1 до 12 
 * @param  {String} fristName   Имя пользователя
 * @param  {Function} cb        Колбек
 */
function lastNameValidation(lastName, cb) {
  if (!lastName) {
    cb(new Error('свойство lastName не передано'));
  }
  if (typeof lastName !== 'string') {
    cb(new Error('свойство lastName должно иметь тип "string"'));
  }
  if (!validator.isLength(lastName, {
      min: 1,
      max: 12
    })) {
    cb(new Error('свойство lastName должно иметь длину не превышающую 12 символов'));
  }
  cb(null);
}

function encryptPassword(password, cb) {
  const salt = Math.random() + '';
  const hashedPassword = crypto.createHmac('sha1', salt).update(password).digest('hex');
  cb(hashedPassword);
}