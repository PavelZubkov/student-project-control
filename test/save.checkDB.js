'use strict';

const mongo = require('../libs/db.js');
const checkDB = require('../models/user/save.js').checkDB;
const config = require('../config');

describe('checkDB', function() {
  let db;

  before('подключение к БД', function(done) {
    // Подключени к БД
    mongo.connect(config.get('db:url'), function(err) {
      if (err) {
        throw err;
      }
      db = mongo.get();
      done();
    });
  });

  beforeEach(function(done) {
    db.users.insertMany(
      [
        {username: 'nousagi', email: 'nous@gmail.com', forTest: true},
        {username: 'zubkov', email: 'zubkov_p@mail.ru', forTest: true}
      ],
      done
    );
  });

  afterEach(function(done) {
    db.users.deleteMany({ forTest: true }, done);
  });

  describe('возвращает ошибку в колбеке, когда', function() {
    it('username и email уже используетcя', function(done) {
      // не читаемо =( потом может быть..
      // username и email у одного пользователя
      checkDB(
        {username: 'nousagi', email: 'nous@gmail.com'},
        function(err) {
          if(err[0] instanceof Error && err[1] instanceof Error) {
            // username у одного, а email занял другой пользователь
            checkDB(
              {username: 'nousagi', email: 'zubkov_p@mail.ru'},
              function(err) {
                if(err[0] instanceof Error && err[1] instanceof Error) {
                  done();
                } else {
                  throw new Error('Ошибка не возвращена');
                }
              } 
            );
          } else {
            throw new Error('Ошибка не возвращена');
          }
        } 
      );
    });

    it('username используется, а email нет', function(done) {
      checkDB(
        {username: 'nousagi', email: 'haaya@gmail.com'},
        function(err) {
          if (err[0] instanceof Error && err.length === 1) {
            done();
          } else {
            throw new Error('Ошибка не возвращена');
          }
        }
      );
    });

    it('email используется, а username нет', function(done) {
      checkDB(
        {username: 'qwerty123', email: 'zubkov_p@mail.ru'},
        function(err) {
          if (err[0] instanceof Error && err.length === 1) {
            done();
          } else {
            throw new Error('Ошибка не возвращена');
          }
        }
      );
    });
  });

  describe('возвращает null в колбеке, когда', function() {
    it('username и email свободны', function(done) {
      checkDB(
        {username: 'free', email: 'free'},
        function(err) {
          if (err === null) {
            done();
          } else {
            throw new Error('null не возвращен');
          }
        }
      );
    });
  });
});