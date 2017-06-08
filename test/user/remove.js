'use strict';

const mongo = require('../libs/db.js');
const remove = require('../models/user/remove.js').remove;
const config = require('../config');
const save = require('../models/user/save.js').save;

describe('remove', function() {
  let db, id;
  
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
    save(
      {
        username: 'test-remove',
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

  afterEach(function(done) {
    db.users.deleteOne({ username: 'test-remove' }, done);
  });
  /**
   * Какие варианты нужно проверить?
   *  1. Передача связки, в которой пароль не верен -> Error(не правильный пароль)
   *  2. Передача верной связки ид + пароль -> cb(null)
   *  3. Правильность валидации ovjectId
   */
  it('возвращает ошибку в коллбеке, когда пароль не верен', function(done) {
    remove(id, 'wrongpassword', function(err) {
      if (!err) {
        throw new Error('ошибка не возвращена');
      }
      if (err.message !== 'не правильный пароль') {
        throw new Error('сообщение ошибки не ожидаемое');
      }
      done();
    });
  });
  
  it('не возвращает ошибку, потому что все верно и пользователь существует', function(done) {
    remove(id, 'qwerty', function(err) {
      if (err) {
        throw err;
      }
      done();
    });
  });
  
  it('возвращает ошибку если id не валидный', function(done) {
    remove('123', 'qwerty', function(err) {
      if (!err) {
        throw new Error('ошибка не возвращена');
      }
      if (err.message !== 'id не валидный') {
        throw new Error('сообщение об ошибке не то');
      }
      done();
    });
  });
});