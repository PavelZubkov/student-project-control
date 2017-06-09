/**
 * Подключиться к БД
 * Создать проект и сохранить его идентификатор
 * Попробовать:
 *  добавить к проекту не существующий email
 *  добавить к проекту
 */
 'use strict';
 
const mongo = require('../../libs/db.js');
const config = require('../../config');
const ObjectId = require('mongodb').ObjectId;
const invite = require('../../models/project/invite.js').invite;

describe('invite(id, email)', function() {
  let db, projectId, userId;
  
  before('подключение к БД', function(done) {
    mongo.connect(config.get('db:url'), function(err) {
      if (err) {
        throw err;
      }
      db = mongo.get();
      db.users.insertOne(
        {
          email: 'use@email.net'
        },
        function(err, r) {
          if (err) {
            throw err;
          }
          userId = r.insertedId;
          done();
        }
      );
    });
  });
  
  after(function(done) {
    db.users.deleteOne(
      {
        _id: userId
      },
      function(err, r) {
        if (err) {
          throw err;
        }
        done();
      }
    );
  });
  
  beforeEach(function(done) {
    db.projects.insertOne(
      {
        name: 'test-project',
        team: [userId]
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
  
  afterEach(function(done) {
    db.projects.deleteOne(
      {
        _id: projectId
      }, 
      function(err, r) {
        if (err) {
          throw err;
        }
        done();
      }
    );
  });
  
  describe('вызывает колбек с ошибкой', function() {
    it('при некорректном адресе', function(done) {
      invite(projectId, 'badEmail', function(err) {
        if (err) {
          done();
        } else {
          done(new Error('ошибка не возвращена'));
        }
      });
    });
    
    it('при незарегистрированом адресе', function(done) {
      invite(projectId, 'not@register', function(err) {
        if (err) {
          done();
        } else {
          done(new Error('ошибка не возвращена'));
        }
      });
    });
    
    it('когда пользователь уже состоит в проекте', function(done) {
      invite(projectId, 'use@email.net', function(err) {
        if (err) {
          done();
        } else {
          done(new Error('щшибка не возвращена'));
        }
      });  
    });
  });
  
  describe('добавляет пользователя в проект', function() {
    const email = 'user@email.net';
    let userId;
    
    before('Создать пользователя', function(done) {
      db.users.insertOne(
        {
          email: email,
          projects: []
        },
        function(err, r) {
          if (err) {
            throw err;
          }
          userId = r.insertedId;
          done();
        }
      );
    });
    
    after('Удаляет пользователя', function(done) {
      db.users.deleteOne(
        {
          _id: userId
        },
        function(err, r) {
          if (err) {
            throw err;
          }
          done();
        }
      );
    });
    
    it('когда все ок', function(done) {
      invite(projectId, email, function(err) {
        if (err) {
          return done(err);
        }
        db.users.findOne(
          {
            projects: projectId
          },
          function(err, doc) {
            if (err) {
              return done(err);
            }
            if (!doc) {
              return done(new Error('Пользователю проект не добавлен'));
            }
            db.projects.findOne(
              {
                team: userId
              },
              function(err, doc) {
                if (err) {
                  return done(err);
                }
                if (!doc) {
                  return done(new Error('В проект не добавлен пользователь'));
                }
                return done();
              }
            );
          }
        );
      });
    });
  });
});