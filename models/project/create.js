'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

/**
 * Создание нового проекта
 *
 */
exports.create = function create(name, userId, cb, options) {
  // 1. валидация 
  if (!name || typeof name !== 'string' || name.length > 40) {
    return cb(new Error('Название проекта не правильного формата'));
  }
  const id = new ObjectId(userId);
  // 2. добавление недостающих свойств
  let project = {
    name: name,
    description: '',
    tasks: null,
    team: [id]
  };
  //хак
  if (options) {
    project = {
      name: `${name} - копия`,
      description: options.description,
      tasks: options.tasks,
      team: [id]
    };
  }
  // 3. Добавление в БД
  db.projects.insertOne(
    project,
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
};