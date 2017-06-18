'use strict';

const mongo = require('../libs/db.js');
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;
const Task = require('../models/task');

describe('Task#getAll', function() {
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
        members: [new ObjectId('594258822fc26514ece3dd39'), new ObjectId('594258882fc26514ece3dd3c')],
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
  
  it('должен возвратить задачи проекта', function(done) {
    Task.getAll(projectId, function(err, tasks) {
      if (err) {
        throw err;
      }
      return done();
    });
  });
});