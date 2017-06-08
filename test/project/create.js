'use strict';

const mongo = require('../../libs/db.js');
const config = require('../../config');
const create = require('../../models/project/create.js').create;
const ObjectId = require('mongodb').ObjectId;

describe('remove', function() {
  let db, id, userId;
  userId = new ObjectId('5936f88360d6832850fca9c0');
  
  before('подключение к БД', function(done) {
    mongo.connect(config.get('db:url'), function(err) {
      if (err) {
        throw err;
      }
      db = mongo.get();
      done();
    });
  });
  
  afterEach(function(done) {
    db.projects.deleteOne({ name: 'test-project' }, done);
  });
  
  it('должен сохранить проект', function(done) {
    create('test-project', userId, function(err, id) {
      if (err) {
        throw err;
      }
      if (!id) {
        throw new Error('id не вернулся');
      }
      db.projects.findOne(
        { name: 'test-project' },
        function(err, doc) {
          if (err) {
            throw err;
          }
          if (doc.name !== 'test-project') {
            throw new Error('Имена не совпадают');
          }
          return done();
        }
      );
    });
  });
  
});