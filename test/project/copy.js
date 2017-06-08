'use strict';

const mongo = require('../../libs/db.js');
const config = require('../../config');
const copy = require('../../models/project/copy.js').copy;
const create = require('../../models/project/create.js').create;
const ObjectId = require('mongodb').ObjectId;

describe('remove', function() {
  let db, projectId, userId;
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
      projectId = _id;
      done();
    });
  });
  
  afterEach(function(done) {
    db.projects.deleteMany({ name: /test-project/ }, done);
  });
  
  it('должен делать копию', function(done) {
    copy(projectId, function(err) {
      if (err) {
        throw err;
      }
      db.projects.find({ name: /test-project/ })
        .count(function(err, count) {
          if (err) {
            throw err;
          }
          if (count === 2) {
            done()
          }
        });
    });
  });
  
});