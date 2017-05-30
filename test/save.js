'use strict';

const mongo = require('../libs/db.js');
const save = require('../models/user/save.js').save;
const config = require('../config');

describe('save', function() {
  let db;

  const user = {
    username: 'save-test',
    password: 'qwertyu',
    email: 'save-test@test.com',
    firstName: 'zubkov',
    lastName: 'pavel',
  };

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

  after(function(done) {
    db.users.deleteOne({ username: 'save-test' }, done);
  });

  it('должна сохранить пользователя в БД и возвратить id', function(done) {
    save(user, function(err, id) {
      if (err) {
        throw err;
      }
      if (!id) {
        throw new Error('id yе возвращен');
      }
      done();
    });
  });
});