'use strict';
/**
 * Для тестов, в которых необходима работа БД.
 * Перед всеми тестами - создает подключение, после всех тестов - закрывает соединение.
 * Перед каждым тестом - создает коллекцию и записывает в нее один документ, после каждого очищает коллекцию.
 *
 * Нужно оптимизировать
 * Нужно понять, как лучше сделать и что вообще из этого нунжо, а что нет
 *
 * Пример подключения во внешнем блоке describe:
    describe('тут используется БД', function() {
      let db, users;
      hooksForTestDb.createHooks(function(rDb, rUsers) {
        db = rDb;
        users = rUsers;
      });
      ...тесты...
    })
 */
const database = require('../libs/db');
const config = require('../config');

let db, users;

exports.createHooks = function(cb) { 

  before('Подключение к MongoDB', function(done) {
    database.connect(config.get('db-test:url'), function(err) {
      if (err) {
        return done(err);
      }
      db = database.get();
      return done();
    });
  });

  after('Отключение от БД', function() {
    db.close();
  });

  beforeEach('Создание коллекции', function(done) {
    db.createCollection('users', function(err, colUsers) {
      users = colUsers;
      cb(db, users);// Возврат db и users в колбеке
      const testUser = {
        username: 'justForTest'
      };
      users.insertOne(testUser, function(err, res) {
        if (err) {
          return donr(err);
        }
        if (res.insertedCount !== 1) {
          return done(new Error('Тестовый документ не сохранен!'));
        }
        return done();
      });
    });
  });

  afterEach('Удаление коллекции', function(done) {
    users.drop(function(err, reply) {
      if (err) {
        return done(err);
      }
      return done();
    });
  });
}