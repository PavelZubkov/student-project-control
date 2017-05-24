/**
 * Для тестирования функции save мне понадобится:
 *  Подключение к БД
 *  Вставляемые данные
 *  Список тестов
 *  Функции для вставки, удаления и проверки данных
 *  
 * При этом тесты не должны:
 *  Влиять на уже существующие данные в базе - при возможности, для тестов использовать свою БД.
 *  
 * Алгоритм тестирования:
 *      0. Объявление группы тестов
 *      1. Объявление теста
 *      2. Создание передаваемых данных
 *      3. Декларирование ожидаемого результата выполнения функции
 *      3. Вызов функции
 *      4. Сравнение результатов
 *      5. Очистка БД.
 * Перед всеми тестами: - подключение к БД
 * После всех тестов: - дроп БД, - отключение
 *
 * 
 * Список тестов:
 *  - генерация исключений // Эти исключения помогут мне отлаживать код
 *    = user не передан
 *    = тип user не object
 *    = cb не передан
 *    = тип cb не function
 *  - передача ошибок в колбеке
 *    = validate user
 *      - username, password, email, firstName, lastName не передан
 *      - username, password, email, firstName, lastName имеет тип не string
 *      - username, password, firstName, lastName имеет длину выходящую за диапазон от 4 до 12 символов включительно
 *      - email имеет длину выходящую за диапазон от 5 до 20 символов включительно
 *    = unique user
 *      - username занят
 *      - email занят
 *  - сохранение корректного user в БД
 */
'use strict';

const config = require('../config');
const assert = require('../libs/assert');
const hooksForTestDb = require('../libs/hooksForTestDb.js');
// Ссылка на функцию
const save = require('../models/user/save').save;

describe('user#save', function() {

  describe('генерирует исключение, когда:', function() {

    it('объект user не передан', function() {
      assert.throws(
        () => {
          save();
        },
        /user не передан/
      );
    });

    it('user не объект', function() {
      assert.throws(
        () => {
          save('string', function() {});
        },
        /user должен быть объектом/
      );
    });

    it('колбек не передан', function() {
      assert.throws(
        () => {
          save( { isObject: true }, undefined);
        },
        /колбек не передан/
      );
    });

    it('колбек не функция', function() {
      assert.throws(
        () => {
          save( {isObject: true}, 12 );
        },
        /колбек должен быть функцией/
      );
    });

  });

  describe('возвращает ошибку в колбеке, когда:', function() {
    const user = {
      username: 'nousagi',
      password: 'qwerty',
      email: 'hayainousagi@gmail.com',
      firstName: 'Павел',
      lastName: 'Зубков'
    }

    it('username отсутствует', function(done) {
      user.username = undefined;
      save(user, function(err, id) {
        console.log(err.message);
      });
    });

  });

});