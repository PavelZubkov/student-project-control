'use strict';

const mongo = require('../../libs/db.js');
const config = require('../../config');
const ObjectId = require('mongodb').ObjectId;
const kick = require('../../models/project/kick.js').kick;
const invite = require('../../models/project/invite.js').invite;

describe('kick', function(){
  // создать пользователя
  // создать проект
  let db, projectId, userId, email = 'use@email.net';
  
  before('подключение к БД, создание ...', function(done) {
    mongo.connect(config.get('db:url'), function(err) {
      if (err) {
        throw err;
      }
      db = mongo.get();
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
          db.projects.insertOne(
            {
              team: []
            },
            function(err, r) {
              if (err) {
                throw err;
              }
              projectId = r.insertedId;
              done();
            }
          );
        }
      );
    });
  });
  
  after('удалить user и project',function(done) {
    db.users.deleteOne(
      {
        _id: userId
      },
      function(err, r) {
        if (err) {
          throw err;
        }
        db.projects.deleteOne(
          {
            _id: projectId
          },
          function(err ,r) {
            if (err) {
              throw err;
            }
            done();
          }
        );
      }
    );
  });
  
  // некорректны адрес
  // незарегистрированный адрес
  // пользователя нет в проекте + еще один user ужен
  // без ошибок - удление
  describe('возвращает ошибку в колбеке, когда', function() {
    it('введен некорректный адрес', function(done) {
      kick(projectId, 'isnotemail', function(err) {
        if (err) {
          done();
        } else {
          done(new Error('ошибка не возвращена'));
        }
      });
    });
    
    it('пользователь с таким адресом не зарегистрирован', function(done) {
      kick(projectId, 'not@use.mail', function(err) {
        if (err) {
          done();
        } else {
          done(new Error('ошибка не возвращена'));
        }
      });
    });
    
    it('пользователь не состоит в этом проекте', function(done) {
      kick(projectId, email, function(err) {
        if (err) {
          done();
        } else {
          done(new Error('ошибка не возвращена'));
        }
      });
    });
  });
  
  describe('без ошибок', function() {
    before('добавить пользователя в проект', function(done) {
      invite(projectId, email, function(err) {
        if (err) {
          throw err;
        }
        return done();
      });
    });
    
    it('исключает пользователя из проекта', function(done) {
      kick(projectId, email, function(err) {
        if (err) {
          throw err;
        }
        db.users.findOne(
          { projects: projectId },
          function(err, doc) {
            if (err) {
              throw err;
            }
            if (doc) {
              return done(new Error('проект не исключен из user.projects'));
            }
            db.projects.findOne(
              { team: userId },
              function(err, doc) {
                if (err) {
                  throw err;
                }
                if (doc) {
                  return done(new Error('пользователь не исключен из project.team'));
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