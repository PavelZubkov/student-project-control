'use strict';

const mongo = require('../libs/db.js');
const update = require('../models/user/update.js').update;
const save = require('../models/user/save.js').save;
const config = require('../config');
const encryptPassword = require('../models/user/save.js').encryptPassword;

describe('update#validate', function() {
  const validate = require('../models/user/update.js').validate;

  const dataForTests = {
    username: {
    // ^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$
      expectNoError: [
        'nousagi', // normal
        'qw', // 2
        'qwertyuiopqwertyuiop' // 20
      ],
      expectError: [
        '0nous', // first digit
        'q', // 1
        'qwertyuiopqwertyuiopqq', // 21
        'йцукен' // not only a-Z
      ]
    },
    email: {
      // /@/
      expectNoError: [
        'nou@nou',
        'updated@updated'
      ],
      expectError: [
        'nou' 
      ]
    },
    initials: {
      // /^[А-ЯA-Z]{2}$/
      expectNoError: [
        'ЗП',
        'ZP'
      ],
      expectError: [
        'зп',
        'ЗПА',
        '123'
      ]
    },
    firstName: {
      // /^([а-яА-ЯёЁa-zA-Z][а-яА-ЯёЁa-zA-Z0-9]){1,12}$/
      expectNoError: [
        'Павел',
        'Pavel',
        'p',
        'двенадцатьдв',
        'П0вел'
      ],
      expectError: [
        '',
        '0pavel',
        'тринадцатьтри',
        '123'
      ]
    },
    lastName: {
      // /^([а-яА-ЯёЁa-zA-Z][а-яА-ЯёЁa-zA-Z0-9]){1,12}$/
      expectNoError: [
        'Павел',
        'Pavel',
        'p',
        'двенадцатьдв',
        'П0вел'
      ],
      expectError: [
        '',
        '0pavel',
        'тринадцатьтри',
        '123'
      ]
    },
    oldPassword: {
      // ^[a-zA-Z][a-zA-Z0-9-_\.]{5,20}$
      expectNoError: [
        'qwerty', //6
        'qwertyuiopqwertyuiop', //20
        'qWeRtY',
        'q1w2e3r54'
      ],
      expectError: [
        '42qwerty', // first digit
        'qw', //2
        'qwertyuiopqwertyuiopqq', //21
      ]
    }
  };
  
  for (let prop in dataForTests) {
      describe(`проверка ${prop}`, function() {
        [ 
          { 
            message: 'проходит успешно',
            expect: 'expectNoError'
          },
          {
            message: 'проходит с ошибкой',
            expect: 'expectError'
          }
        ].forEach(function(v) {
          describe(v.message, function() {
            for (let arg of dataForTests[prop][v.expect]) {
              it(arg, function() {
                let result;
                if (prop === 'oldPassword') {
                  result = validate( { [prop]: arg, newPassword: 'qwertyu'});
                } else {
                  result = validate( { [prop]: arg } );
                }
                if (v.message === 'проходит успешно') {
                  if (result[prop] !== arg) {
                    throw new Error(`получено ${result[prop]}, а не ${arg}`);
                  }
                } else {
                  if (result instanceof Error !== true) {
                    throw new Error(`получено ${result}, а ожидается объект ошибки`);
                  }
                }
              });
            }
          });
        });
    });
  }
  
  describe('проверка password', function() {
    it('ошибка, если новый пароль не передан, а старый передан', function() {
      const result = validate( { oldPassword: 'qwerty'} );
      if (result instanceof Error !== true) {
        throw new Error(`ожидается объект ошибки, а не ${result}`);
      }
    });
  });
});

describe('update', function() {
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

  afterEach(function(done) {
    db.users.deleteOne({ _id: id }, done);
  });
  
  const checkUpdate = function checkUpdate(id, nameProperty, expectValue, cb) {
        db.users.findOne(
      { _id: id },
      function(err, r) {
        if (err) {
          return cb(err);
        }
        if (r[nameProperty] !== expectValue) {
          return cb(new Error(`ожидается, что "${nameProperty}" равно "${expectValue}", а не "${r.nameProperty}"`));
        }
        return cb(null);
      }
    );
  };
  /**
   * Какие тесты нужны?
   *  обновление данных не существующего пользователя
   *  обновление каждого из полей
   *  обновление не существующих полей
   *
   */
  describe('возвращает ошибку, когда', function() {
    it('обновляемого пользователя не существует', function(done) {
      update(
        { id: '59329710884e725826394e2b', username: 'newnameqwe'},
        function(err) {
          if (err) {
            done();
          } else {
            throw new Error('ошибка не возвращена');
          }
        }
      );
    });
  });
  describe('должно обновиться поле', function() {
    ['username', 'email', 'firstName', 'lastName', 'initials']
      .forEach(function(propertyName) {
        let newValue;
        if (propertyName === 'email') {
          newValue = 'updated@updated';
        } else if (propertyName === 'initials') {
          newValue = 'UP';
        } else {
          newValue = 'Updated';
        }
        it(`${propertyName} - ${newValue}`, function(done) {
          update(
            {
              id: id,
              [propertyName]: newValue
            },
            function(err) {
              if (err) {
                throw err;
              }
              checkUpdate(id, propertyName, newValue, function(err) {
                if (err) {
                  throw err;
                }
                done();
              });
            }
          );
        });
      });
  });
  describe('обновление пароля', function() {
    it('ошибка - не передан новый пароль', function(done) {
      update(
        { id: id, oldPassword: 'qwerty' },
        function(err) {
          if (err) {
            return done();
          }
          return done(new Error('ошибка не возвращена'));
        }
      );
    });
    
    it('ошибка - переданый пароль не совпадает с паролем в БД', function(done) {
      update(
        { id: id, oldPassword: 'qwaszxwesdxc', newPassword: 'qweqweqe'},
        function(err) {
          if (err) {
            return done();
          }
          return done(new Error('ошибка не возвращена'));
        }
      );
    });
    
    it('пароль должен обновиться', function(done) {
      const oldPassword = 'qwerty';
      const newPassword = 'qwaszx';
      const hashedNewPassword = encryptPassword(newPassword);
      update(
        { id: id, oldPassword: oldPassword, newPassword: newPassword },
        function(err) {
          if (err) {
            throw err;
          }
          checkUpdate(id, 'hashedPassword', hashedNewPassword, function(err) {
            if (err) {
              throw err;
            }
            return done();
          });
        }
      );
    });
  });
});