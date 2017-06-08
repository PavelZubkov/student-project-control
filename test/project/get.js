'use strict';

const mongo = require('../../libs/db.js');
const config = require('../../config');
const get = require('../../models/project/get.js').get;
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
  
  it('должен возвратить проект', function(done) {
    get(userId, function(err, projects) {
      if (err) {
        throw err;
      }
      console.log(projects);
      if (projects.length) {
        done();
      }
    });
  });
  
});