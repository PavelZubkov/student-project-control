'use strict';

const mongo = require('../libs/db.js');
const config = require('../config');
const save = require('../models/user/save.js').save;
const get = require('../models/user/get.js').get;

describe('get', function() {
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
  
  it('id должен быть типа ObjectId', function(done) {
    get('593393337e3ee75dcacfbe4', function(err, user) {
      if (err) {
        return done();
      }
      throw new Error('ошибка не возвращена');
    });
  });
  it('id не существует', function(done) {
    get('593393337e3ee75dcacfbe43', function(err, user) {
      if (err) {
        return done();
      }
      throw new Error('ошибка не возвращена');
    });
  });
  it('должна возвратить данные пользователя', function(done) {
    get(id, function(err, user) {
      if (err) {
        throw err;
      }
      if (
        user.username !== 'test' ||
        user.email !== 'zubkov_p@mail.ru' ||
        user.firstName !== 'Zubkov' ||
        user.lastName !== 'Pavel'
      ) {
        throw new Error('возвращены не те данные');
      } else {
        done();
      }
    });
  });
});