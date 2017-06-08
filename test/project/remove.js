'use strict';

const mongo = require('../../libs/db.js');
const config = require('../../config');
const create = require('../../models/project/create.js').create;
const ObjectId = require('mongodb').ObjectId;
const remove = require('../../models/project/remove.js').remove;

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
  
  beforeEach(function(done) {
    create('test-project', userId, function(err, _id) {
      if (err) {
        throw err;
      }
      id = _id;
      done();
    });
  });
  
  afterEach(function(done) {
    db.projects.deleteOne({ name: 'test-project' }, done);
  });
  
  it('должен удалить проект', function(done) {
    remove(id, function(err) {
      if (err) {
        throw err;
      }
      db.projects.findOne( { _id: id}, function(err, doc) {
        if (err) {
          throw err;
        }
        if (!doc) {
          return done();
        } else {
          return done(new Error('Проект не удален'));
        }
      });
    });
  });
  
});