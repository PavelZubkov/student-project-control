'use strict';

const mongo = require('../libs/db.js');
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;
const Task = require('../models/task');

describe('Task#move', function(){
  let db, projectId, tasksId = [];
  
  before('Должен подключить к БД', function(done) {
    mongo.connect(config.get('db:url'), function(err) {
      if (err) {
        throw err;
      }
      db = mongo.get();
      return done();
    });
  });
  
  after('Должен отключить от БД', function(done) {
    db.db.close();
    done();
  });
  
  beforeEach('Должен создать фиктивный проект с 5 задачами', function(done) {
    const mockProject = {
      name: 'created for testing test#move',
      tasks: []
    };
    for (let i = 0; i < 5; i++) {
      let id = new ObjectId();
      let task = {
        id: id,
        name: `task#${i+1}`,
        description: 'lorem ipsum dolor color hi',
        members: ['6a6a6a6a6a6a6a6a6a6a6a6a'],
        dueDate: new Date(1999+i, 11, 20),
        state: 'Завершено'
      };
      tasksId.push(id);
      mockProject.tasks.push(task);
    }
    db.projects.insertOne(
      mockProject,
      function(err, r) {
        if (err) {
          throw err;
        }
        if (r.insertedCount !== 1) {
          throw new Error('Не сохранен документ');
        }
        projectId = r.insertedId;
        return done();
      }
    );
  });
  afterEach('Должен удалить фиктивный проект', function(done) {
    tasksId = [];
    db.projects.deleteOne({
      _id: projectId
    },
    done
    );
  });
  
  const getTasks = function getTasks(projectId, cb) {
    db.projects.findOne({
      _id: projectId
    }, function(err, doc) {
      if (err) {
        throw err;
      }
      if (!doc) {
        throw new Error('Проект не найден');
      }
      return cb(null, doc.tasks);
    });
  };
  /**
   * 
   * Вызов функции такой: Task.move(projectId, taskId, position, cb)
   * position - номер задачи, после которой нужно разместь задачу taskId
   *  считать, что нумерация начинается с единицы( 1. Авада 2. Кедавра т.д)
   *  что бы поместить задачу в начала, position = 0.
   *  что бы поместить в конец, position = номер последней задачи
   * 
   * Варианты:
   *  - В случае с position=0, новое место = 1(нумерация с 1)
   *  - Если position=конец списка, новое место = конец списка=position
   *  - Если position > старого места, новое место = position
   *  - Если position < стаорго места, новое место = position + 1
   * из этого следует, всего два варианта:
   *  - Если задача перенеслась вниз, то новое место = position
   *  - Если задача перенеслась вверх, то новое место = position + 1
   *      
   */
  /**
    Функция checkPosition проверяет, что с первоначального места задача удалена, что задача перенесена на новое место, что количество элементов в списке не изменилось. 
     Позиция в oldPos и newPos указана относительно списка начинающегося с 1
     Пример списка задач:
      1. Авада
      2. Кедавра
      3. Люмиос
      4. Ступефай
      5. Сомниум
      
      Предположим задачу "2. Кедавра" перенесли после задачи "4. Ступефай"
        Вызов функции move: Task.move(projectId, taskId2, 4, cb);
        Новый список выглядит теперь:
      1. Авада
      2. Люмиос
      3. Ступефай
      4. Кедавра - новая позиция #4
      5. Сомниум
        Вызов функции для проверки переноса - 
        checkPosition(projectId, 2, 4, cb) 
          - если oldPos<newPos, новая задача должна быть на позиции 4(отсчет с единицы при отсчте с нуля - 3)
          - если oldPos>newPos, новая задача должна быть на позиции newPos+1
   */
  const checkPosition = function checkPosition(tasks, taskId, oldPos, newPos) {
    if (oldPos < newPos) {
      newPos--; // т.к. в массиве элементы отсчитываются с нуля
      oldPos--; // т.к. ^
    } else if (oldPos > newPos) {
      oldPos--; // т.к. ^
      // newPos не изменено, т.к. при переносе вверх новая позиция равна newPos+1, но т.к. в массиве элементы отсчитываются с нуля нужно отнять одни - newPos+1-1
    } else {
      throw new Error('oldPos не должно быть равно newPos');
    }
    taskId = new ObjectId(taskId);
    if (taskId.equals(tasks[oldPos].id)) {
      throw new Error('Задача не удалена со старого места');
    }
    if (!taskId.equals(tasks[newPos].id)) {
      throw new Error('Задача не перенесена на новое место');
    }
    if (tasks.length !== 5) {
      throw new Error('Количество элементов в массиве изменилось'); 
    }
    return true;
  };
  
  describe('Тестирование checkPosition', function() {
    // Тестирование тестирующего кода, явпалвперфекционизм
    let tasks;
    
    beforeEach('Нужно создать пробный список задач', function() {
      tasks = [{
        id: new ObjectId(),
        name: 'Авада'
      }, {
        id: new ObjectId(),
        name: 'Кедавра'
      }, {
        id: new ObjectId(),
        name: 'Люмиос'
      }, {
        id: new ObjectId(),
        name: 'Ступефай'
      }, {
        id: new ObjectId(),
        name: 'Сомниум'
      }];
    });
    
    describe('Не должна выбросить ошибку.', function() {
      it('при переносе 1.Авада за 3.Люмиос', function() {
        const task = tasks[0] // Авада
        tasks.splice(3, 0, task);
        tasks.splice(0, 1);
        checkPosition(tasks, task.id, 1, 3);
        // Перенос задачи с 1-й позиции за 3-ю
      });
      
      it('при переносе 4.Ступефай, за 1.Авада', function() {
        const task = tasks[3] // Ступефай
        tasks.splice(1, 0, task);
        tasks.splice(4, 1);
        checkPosition(tasks, task.id, 4, 1); 
        // Перенос задачи с 4-й позиции за 1-ю
      });
      
      it('при переносе 1.Авада за 5.Сомниум', function() {
        const task = tasks[0] // Авада
        tasks.splice(5, 0, task);
        tasks.splice(0, 1);
        checkPosition(tasks, task.id, 1, 5); 
        // Перенос задачи с 1-й позиции за 5-ю
      });
      
      it('при переносе 5.Сомниум на первую позицию', function() {
        const task = tasks[4]; // Сомниум
        tasks.splice(0, 0, task);
        tasks.splice(5, 1);
        checkPosition(tasks, task.id, 5, 0);
        // Переос задачи с 5-й позиции на первую
      });
    });
    
  });
  
  describe('#move должна', function() {
    /**
     * Вызывает task.move и проверяет результат вызова
     *
     */
    const moveTaskAndCheck = function moveTaskAndCheck(i, j, cb) {
      let id = tasksId[i-1];
      Task.move(projectId, id, j, function(err) {
        if (err) {
          return cb(err);
        }
        getTasks(projectId, function(err, tasks) {
          if (err) {
           return cb(err);
          }
          const error = checkPosition(tasks, id, i, j);
          if (error instanceof Error) {
            return cb(error);
          } else {
            return cb(null);
          }
        });
      });
    };
    
    for(let i = 1; i <= 5; i++) {
      for (let j = 0; j <= 5; j++) {
        // i - номер перемещаемой задачи(с единицы)
        // j - новая позиция задачи(с единицы)
        if ( // должна вернуть ошибку
          i === j || // Перемещать задачу за себя?
          i-1 === j // Перемещать задачу на перед собой?
        ) {
          it(`вернуть ошибку, при переносе ${i}-й задачи за ${j}-ю позицию`, function(done) {
            moveTaskAndCheck(i, j, function(err) {
              if (err) {
                return done();
              } else {
                return done(new Error('Ошибка не возвращена'));
              }
            });
          });
        } else {
          it(`выполниться без ошибок, при переносе ${i}-й задачи за ${j}-ю позицию`, function(done) { 
            moveTaskAndCheck(i, j, function(err) {
              if (!err) {
                return done();
              } else {
                return done(err);
              }
            });
          });
        } 
      }
    }
  });
});