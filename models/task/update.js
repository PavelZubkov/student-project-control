'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;
const validate = require('./validate');

/**
 * Делает запрос к mongo
 *
 */
const _update = function _update(query, update, cb) {
  db.projects.findOneAndUpdate(
    query,
    update, { returnOriginal: false },
    function(err, r) {
      if (err) {
        throw err;
      } 
      if (!r.value || r.ok !== 1) {
        return cb(new Error('Ошибка mongoDB'));
      }
      return cb(null, r);
    }
  );
};
/**
 * Возвращает объек задачи из объекта ответа от mongo
 *
 */
const returnTask = function returnTask(doc, taskId, cb) {
  const task = doc.value.tasks.find(function(element) {
    const elId = new ObjectId(element.id);
    if (elId.equals(taskId)) {
      return true;
    } else {
      return false;
    }
  });
  return cb(null, task);
};
/**
 * Удаляет участника из проекта
 *
 */
const subMember = function subMember(query, newValue, cb) {
  const update = {};
  update.$pullAll = { 'tasks.$.members': [] };
  for (let sub of newValue.members.sub) {
    update.$pullAll[`tasks.$.members`].push(sub);
  }
  
  _update(query, update, function(err, r) {
    if (err) {
      return cb(err);
    }
    return returnTask(r, query['tasks.id'], cb);
  });
};
/**
 * Добавляет участника к проекту
 *
 */
const addMember = function addMember(query, newValue, cb) {
  const update = {};
  update.$push = { 'tasks.$.members': { $each: [] } };
  for (let add of newValue.members.add) {
    update.$push['tasks.$.members'].$each.push(add);
  }
  _update(query, update, function(err, r) {
    if (err) {
      return cb(err);
    }
    if ('sub' in newValue.members) {
      return subMember(query, newValue, cb);
    } else {
      return returnTask(r, query['tasks.id'], cb);
    }
  });
};
/**
 * Изменяет поля name, description, dueDate, state
 *
 */
const setFields = function setFields(query, newValue,cb) {
  const update = {};
  for (let prop in newValue) {
    if (prop !== 'members') {
      if (typeof update.$set === 'undefined') {
        update.$set = {};
      }
      update.$set[`tasks.$.${prop}`] = newValue[prop];
    }
  }
  
  _update(query, update, function(err, r) {
    if (err) {
      return cb(err);
    }
    if ('members' in newValue) {
      if ('add' in newValue.members) {
        return addMember(query, newValue, cb);
      } else if ('sub' in newValue.members) {
        return subMember(query, newValue, cb);
      }
    } else {
        return returnTask(r, query['tasks.id'], cb);
    }
  });
};
/**
 * Валидация объекта
 *
 */
const check = function check(newValue) {
  const options = []
      , data = {};
  for (let prop in newValue) {
    if (prop !== 'members') {
      options.push(prop);
      data[prop] = newValue[prop];
    } else if (prop === 'members') {
      options.push(prop);
      const members = [];
      if (newValue.members.add) {
        for (let add of newValue.members.add) {
          members.push(add);
        }
      }
      if (newValue.members.sub) {
        for (let sub of newValue.members.sub) {
          members.push(sub);
        }
      }
      data['members'] = members;
    }
  }
  
  return validate(data, options);
};
/**
 * Изменяет поля задачи на значения полей указаных в newValue
 *
 */
module.exports = function update(projectId, taskId, newValue, cb) {
  projectId = new ObjectId(projectId);
  taskId = new ObjectId(taskId);
  
  if (!Object.keys(newValue).length) {
    return cb(null, {});
  }
  
  const error = check(newValue);
  if (error) {
    return cb(error);
  }
  
  const query = {
    _id: projectId,
    'tasks.id': taskId
  };
  if (
    'name' in newValue ||
    'description' in newValue ||
    'dueDate' in newValue ||
    'state' in newValue
  ) {
    return setFields(query, newValue, cb);
  }
  if ('members' in newValue) {
    if ('add' in newValue.members) {
      return addMember(query, newValue, cb);
    } else if ('sub' in newValue.members) {
      return subMember(query, newValue, cb);
    }
  } else {
    return cb(new Error('Объект newVakue не должен быть пуст'));
  }
};