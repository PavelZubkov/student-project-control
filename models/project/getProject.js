'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;
const log = require('../../libs/log.js')(module);
const Task = require('../task');

/**
 * Возвращает массив с данными о участниках команды проекта
 *
 */
const getTeam = function getTeam(teamIds, cb) {
  const team = [];
  const query = {
    $or: []
  };
  for (let userId of teamIds) {
    query.$or.push( { _id: userId } );
  }
  const cursor = db.users.find(query);
  cursor.toArray(function(err, users) {
    if (err) {
      return cb(err);
    }
    for (let user of users) {
      team.push(
        {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          initials: user.initials,
          email: user.email
        }
      );
    }
    return cb(null, team);
  });
};
exports.getTeam = getTeam;
/**
 * Возвращает массив с данными о задачах проекта
 *
 */
const getTasks = function getTasks(projectId, cb) {
  Task.getAll(projectId, function(err, tasks) {
    if (err) {
      return cb(err);
    }
    return cb(null, tasks);
  });
};
/**
 * Возвращает объект с данными проекта
 * {
 *   id - 
 *   name - название
 *   description - описание
 *   tasks - массив задач - позже
 *   team - массив с данными каждого пользователя - ид, имя, фамилия, инициалы, эл.почта,
 * }
 *
 *  @param {ObjectId} id ид проекта
 * 
 *  алгоритм:
 *    1. валидация id
 *    2. получение данных проекта
 *    3. получение данных задач
 *    4. получение данных пользователя
 *    5. возврат 
 */
exports.getProject = function getProject(id, cb) {
  if (!ObjectId.isValid(id)) {
    return cb(new Error('id не корректный'));
  }
  id = new ObjectId(id);
  const project = {};
  db.projects.findOne(
    { _id: id },
    function(err, doc) {
      if (err) {
        return cb(err);
      }
      if (!doc) {
        return cb(new Error('нет такого проекта'));
      }
      project.id = doc._id;
      project.name = doc.name;
      project.description = doc.description;
      getTasks(id, function(err, tasks) {
        if (err) {
          return cb(err);
        }
        project.tasks = tasks;
        getTeam(doc.team, function(err, team) {
          if (err) {
            return cb(err);
          }
          project.team = team;
          return cb(null, project);
        });
      });
    }
  );
};