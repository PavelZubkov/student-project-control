'use strict';

const mongo = require('../libs/db.js');
const config = require('../config');
const save = require('../models/user/save.js').save;
const auth = require('../models/user/auth.js').auth;

describe('auth', function() {
  let db, id;

  before('подключение к БД', function(done) {
    // Подключени к БД
    mongo.connect(config.get('db:url'), function(err) {
      if (err) {
        throw err;
      }
      db = mongo.get();
      save(
        {
          username: 'test',
          password: 'qwerty',
          email: 'zubkov_p@mail.ru',
          firstName: 'Zubkov',
          lastName: 'Pavel'
        },
        function(err, _id) {
          if (err) {
            throw err;
          }
          id = _id;
          done();
        }
      );
    });
  });

  after(function(done) {
    db.users.deleteOne({ _id: id }, done);
  });
  
  it('возвращает ошибку, когда пользователя username не существует', function(done) {
    auth('testnotest', 'qwerty', function(err) {
      if (err) {
        return done();
      } else {
        return done(new Error('ошибка не возвращена'))
      }
    });
  });
  it('возвращает ошибку, когда пароль не верен', function(done) {
    auth('test', 'qwertyq', function(err) {
      if (err) {
        return done();
      } else {
        return done(new Error('ошибка не возвращена'))
      }
    });
  });
  it('возвращает id пользователя когда все ок', function(done) {
    auth('test', 'qwerty', function(err, id) {
      if (err) {
        return done(err);
      }
      if (!id) {
        throw new Error('id не возвращено');
      }
      return done();
    });
  });
});