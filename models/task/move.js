'use strict';

const db = require('../../libs/db.js').get();
const ObjectId = require('mongodb').ObjectId;

/**
 * Перемещает задачу taskId в проекте ProjectId за задачу с порядковым номером
 * position(при отсчете с единицы, а не с нуля). Если position = 0, перемещает
 * задачу в начало списка.
 *
 */
module.exports = function move(projectId, taskId, position, cb) {
  if (!ObjectId.isValid(projectId) || !ObjectId.isValid(taskId)) {
    return cb(new Error('id должны быть ObjectId'));
  }
  projectId = new ObjectId(projectId);
  taskId = new ObjectId(taskId);
  db.projects.findOneAndUpdate({
    _id: projectId,
    'tasks.id': taskId
  }, {
    $set: {
      'tasks.$.del': true
    }
  }, function(err, r) {
    if (err) {
      return cb(err);
    }
    if (!r.value) {
      return cb(new Error('Нет проекта с таким id'));
    }
    let oldPosition, task;
    const found = r.value.tasks.some(function(elem, index) {
      if (taskId.equals(elem.id)) {
        task = elem;
        oldPosition = index+1;// отсчет с единицы
        return true;
      }
    });
    if (!found) {
      return cb(new Error('Задача с таким id не найдена'));
    }
    if ( // должна вернуть ошибку
      oldPosition === position || // Перемещать задачу за себя?
      oldPosition-1 === position // Перемещать задачу на перед собой?
    ) {
      return cb(new Error('Нельзя переместить задачу сразу за себя или сразу перед собой'));
    } else {
      db.projects.findOneAndUpdate({
        _id: projectId,
      }, {
        $push: {
          tasks: {
            $each: [task],
            $position: position
          }
        }
      }, { returnOriginal: false },
      function(err, r) {
        if (err) {
          throw err;
        }
        if (r.ok !== 1) {
          throw new Error('ошибка при переносе');
        }
        db.projects.findOneAndUpdate({
          _id: projectId,
          'tasks.del': true
        }, {
          $pull: {
            tasks: {
              del: true
            }
          }
        }, function(err, r) {
          if (err) {
            return cb(err);
          }
          if (r.ok !== 1) {
            return cb(new Error('Ошибка при удалении'));
          }
          return cb(null);
        });
      });
    } 
  });
};