'use strict';

const mongo = require('../../libs/db.js');
const config = require('../../config');
const ObjectId = require('mongodb').ObjectId;
const create = require('../../models/task/create.js');

describe('create', function(){
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
  
  it('должна сохранить задачу', function(done) {
    create(projectId, 'first task', function(err) {
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