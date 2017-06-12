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
      db.projects.insertOne(
        {
          tasks: []
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
    db.projects.deleteOne(
      {
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
  
  describe('create', function(){
    it('должна сохранить задачу', function(done) {
      Task.create(projectId, 'first task', function(err) {
        if (err) {
          throw err;
        }
        db.projects.findOne(
          {
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
  
  describe('remove', function() {
    it('должна удалить задачу', function(done) {
      const taskId = new ObjectId();
      db.projects.findOneAndUpdate(
        {
          _id: projectId,
        },
        {
          $push: {
            tasks: {
              id: taskId,
              name: 'for delete'
            }
          }
        }, { returnOriginal: false },
        function(err, r) {
          if (err) {
            throw err;
          }
          Task.remove(projectId, taskId, function(err) {
            if (err) {
              throw err;
            }
            db.projects.findOne(
              {
                _id: projectId,
                'tasks.id': taskId
              },
              function(err, doc) {
                if (err) {
                  throw err;
                }
                if (!doc) {
                  return done();
                } else {
                  return done(new Error('Элемент не был удален'));
                }
              }
            );
          });
        }
      );
    });
  });
});