'use strict';

const mongo = require('../../libs/db.js');
const config = require('../../config');
const create = require('../../models/project/create.js').create;
const ObjectId = require('mongodb').ObjectId;
const getTeam = require('../../models/project/getProject.js').getTeam;
const getProject = require('../../models/project/getProject.js').getProject;

describe('getProject', function() {
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
  
  it('#getTeam(teamIds) должна возвратить данные пользователя', function(done) {
    const teamIds = [new ObjectId('5936f88360d6832850fca9c0')];
    getTeam(teamIds, function(err, team) {
      if (err) {
        throw err;
      }
      if (!team) {
        throw new Error('не возвращены данные');
      } else {
        console.log(team);
        done();
      }
    });
  });
  
  it('getProject должна возвратить данные проекта', function(done) {
    getProject(projectId, function(err, project) {
      if (err) {
        throw err;
      }
      if (!project) {
        throw new Error('не возвращены данные');
      } else {
        console.log(project);
        done();
      }
    });
  });
  
});