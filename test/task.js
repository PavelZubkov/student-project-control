'use strict';

const mongo = require('../libs/db.js');
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;
const Task = require('../models/task');

describe('task', function() {
  let db, projectId;

  before('подключение к БД', function(done) {
    mongo.connect(config.get('db:url'), function(err) {
      if (err) {
        throw err;
      }
      db = mongo.get();
      db.projects.insertOne({
          tasks: [],
          name: 'Как узнать?'
        },
        function(err, r) {
          if (err) {
            throw err;
          }
          projectId = r.insertedId;
          done();
        }
      );
    });
  });

  after(function(done) {
    db.projects.deleteOne({
        _id: projectId
      },
      function(err, r) {
        if (err) {
          throw err;
        }
        return done();
      }
    );
  });

  describe('#create', function() {
    it('должна сохранить задачу', function(done) {
      Task.create(projectId, 'first task', function(err) {
        if (err) {
          throw err;
        }
        db.projects.findOne({
            'tasks.name': 'first task'
          },
          function(err, doc) {
            if (err) {
              throw err;
            }
            return done();
          }
        );
      });
    });
  });

  describe('#remove', function() {
    it('должна удалить задачу', function(done) {
      const taskId = new ObjectId();
      db.projects.findOneAndUpdate({
          _id: projectId,
        }, {
          $push: {
            tasks: {
              id: taskId,
              name: 'for delete'
            }
          }
        }, {
          returnOriginal: false
        },
        function(err, r) {
          if (err) {
            throw err;
          }
          Task.remove(projectId, taskId, function(err) {
            if (err) {
              throw err;
            }
            db.projects.findOne({
                _id: projectId,
                'tasks.id': taskId
              },
              function(err, doc) {
                if (err) {
                  throw err;
                }
                if (!doc) {
                  return done();
                }
                else {
                  return done(new Error('Элемент не был удален'));
                }
              }
            );
          });
        }
      );
    });
  });

  describe('#get', function() {
    const taskId = new ObjectId();

    beforeEach('создать задачу', function(done) {
      db.projects.findOneAndUpdate({
          _id: projectId,
        }, {
          $push: {
            tasks: {
              id: taskId,
              name: 'for get',
              members: [],
              dueDate: new Date(),
              state: 'В предзавершении'
            }
          }
        }, {
          returnOriginal: false
        },
        function(err, r) {
          if (err) {
            throw err;
          }
          Task.create(projectId, 'opw', function(err) {
            if (err) {
              throw err;
            }
            return done();
          });
        }
      );
    });

    afterEach('удалить задачу', function(done) {
      db.projects.findOneAndUpdate({
          _id: projectId,
        }, {
          $pull: {
            tasks: {
              id: taskId
            }
          }
        },
        function(err, r) {
          if (err) {
            throw err;
          }
          return done();
        }
      );
    });
    it('должна возвращать данные задачи', function(done) {
      Task.get(projectId, taskId, function(err, doc) {
        if (err) {
          throw err;
        }
        if (doc.name === 'for get') {
          return done();
        }
        else {
          return done(new Error('Возвращено что-то не то'));
        }
      });
    });
  });

  describe('#update', function() {
    const taskId = new ObjectId();
    const oldMember = new ObjectId('593ded151cbbc31180c3cfbf');
    beforeEach('Создание задачи', function(done) {
      db.projects.findOneAndUpdate({
          _id: projectId
        }, {
          $push: {
            tasks: {
              id: taskId,
              name: 'for update',
              describe: 'Описание задчи',
              members: [oldMember],
              dueDate: new Date(),
              state: 'В очереди'
            }
          }
        }, function(err, r) {
          if (err) {
            throw err;
          }
          return done();
        }
      );
    });
    
    afterEach('Удаление созданой задачи', function(done) {
      db.projects.findOneAndUpdate({
          _id: projectId
        }, {
          $pull: {
            tasks: {
              id: taskId
            }
          }
        }, function(err, r) {
          if (err) {
            throw err;
          }
          return done();
        }
      );  
    });
    
    it('изменяет поле name', function(done) {
      const newName = 'brr';
      Task.update(projectId, taskId, { name: newName }, function(err, doc){
        if (err) {
          throw err;
        }
        if (doc.name === newName) {
          return done();
        } else {
          return done(new Error('Значение поля name не изменено'));
        }
      });
    });
    
    it('изменяет поле description', function(done) {
      const newD = 'Lorem ipsum dolor.';
      Task.update(projectId, taskId, { description: newD }, function(err, doc){
        if (err) {
          throw err;
        }
        if (doc.description === newD) {
          return done();
        } else {
          return done(new Error('Значение не изменено'));
        }
      });
    });
    
    describe('members', function() {
      const member1 = new ObjectId();
      const member2 = new ObjectId();
      const member3 = new ObjectId();
      
      it('должна добавить одного', function(done) {
        Task.update(projectId, taskId, {members: { add: [member1] } }, function(err, doc) {
          if (err) {
            throw err;
          }
          const newMember = doc.members.find(function(element) {
            return member1.equals(element);
          });
          if (newMember) {
            return done();
          } else {
            return done(new Error('Участник не добавлен'));
          }
        });
      });
      
      it('должна удалить одного', function(done) {
        Task.update(projectId, taskId, {members: { add: [member1] } }, function(err, doc) {
          if (err) {
            throw err;
          }
          Task.update(
            projectId,
            taskId,
            { members: { sub: [member1] } },
            function(err, doc) {
              if (err) {
                throw err;
              }
              const newMember = doc.members.find(function(element) {
                return member1.equals(element);
              });
              if (!newMember) {
                return done();
              } else {
                return done(new Error('участник не удален'));
              }
            }
          );
        });
      });
      
      it('должна добавить несколько участников', function(done) {
        Task.update(
          projectId,
          taskId,
          {members: { add: [member1, member2, member3] } },
          function(err, task) {
            if (err) {
              throw err;
            }
            // в task.members должны быть три добавленных ида
            const ok = Array.of(member1, member2, member3).every(function(i) {
              return task.members.some(function(j) {
                return i.equals(j);
              });
            });
            if (ok) {
              return done();
            } else {
              return done(new Error('Участники не добавлены'));
            }
          }
        );
      });
      
      it('должна удалить несколько', function(done) {
        Task.update(
          projectId,
          taskId,
          {members: { add: [member1, member2, member3] }},
          function(err, doc) {
            if (err) {
              throw err;
            }
            Task.update(
              projectId,
              taskId,
              { members: { sub: [member1, member2, member3] } },
              function(err, doc) {
                if (err) {
                  throw err;
                }
                // изначально один members был
                if (doc.members.length === 1) {
                  return done();
                } else {
                  return done(new Error('Несколько участников не удалено'));
                }
              }
            );
          }
        );
      });
    });
    
    it('должна изменить dueDate', function(done) {
      const now = new Date();
      Task.update(
        projectId,
        taskId,
        { dueDate: now },
        function(err, doc) {
          if (err) {
            throw err;
          }
          if (doc.dueDate.getTime() === now.getTime()) {
            return done();
          } else {
            return done(new Error('dueDate не изменено'));
          }
        }
      );
    });
    
    describe('должна изменить state на', function() {
      const props = ['В очереди', 'Выполнено', 'Завершено', 'Черновик'];
      for (let prop of props) {
        it(prop, function(done) {
          Task.update(
            projectId,
            taskId,
            {state: prop},
            function(err, doc) {
              if (err) {
                throw err;
              }
              if (doc.state === prop) {
                return done();
              } else {
                return done(new Error('Состояние не изменено'));
              }
            }
          );
        });
      }
    });
    
    it('должна изменить name и добавить двух участников и удалить одного', function(done) {
      const newName = 'zuuuu'
      , member1 = new ObjectId()
      , member2 = new ObjectId();
      
      Task.update(
        projectId,
        taskId,
        { name: newName, members: { add: [member1, member2], sub: [oldMember] } },
        function(err, task) {
          if (err) {
            throw err;
          }
          if (
            task.name === newName ||
            task.members[0].equals(member1) && task.members[1].equals(member2) ||
            task.members.length === 2
          ) {
            return done();
          } else {
            return done(new Error('Операция не выполнена'));
          }
        }
      );
    });
  });
});
