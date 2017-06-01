/**
 * Я начал производить валидацию внутри модели в функции save.
 * Потом подумал - где еще понадобится валидация данных?
 *  > Везде где происходит ввод.
 * Какие "виды|типы" валидации понадобятся?
 *  > на наличие данных
 *  > на соответсвие определенному типу данных
 *  > на принадлежность определенному диапозону длин, напр: количеству символов
 *  > на соответсвие определенному формату, напр: email@email.email
 *  > на наличие|отсутствие запрещенных|разрешенных символов|слов, напр: <scrtip>...
 *  > вроде все
 * Получиться найти полностью подходящее готовое решение?
 *  > https://www.npmjs.com/package/validate
 * Какие шаблоны regexp мне нужны?
 *  >username
 *  >password
 *  >email
 *  >firstName
 *  >lastName
 *
 * Сообщение об ошибках вынести в отдельный файл?
 *
 * я начал лучше понимать предназначение mongoose
 */

const schema = require('validate');

exports.User = schema({
  username: {
    required: [
      true,
      'требуется username'
    ],
    type: [
      'string',
      'username должен иметь тип string' 
    ],
    match: [
      /^[a-zA-Z][a-zA-Z0-9-_\.]{2,20}$/,
      'username должен начинаться с буквы и может состоять из символов латинского алфавита, цифр и знаков ".", "-", "_". Иметь длину от 2 до 20 символов'
    ]
  },
  password: {
    required: [
      true,
      'требуется password'
    ],
    type: [
      'string',
      'password должен иметь тип string' 
    ],
    match: [
      /^[a-zA-Z][a-zA-Z0-9-_\.]{6,20}$/,
      'password должен иметь длину от 6 до 20 символов'
    ]
  },
  email: {
    required: [
      true,
      'требуется email'
    ],
    type: [
      'string',
      'email должен иметь тип string' 
    ],
    match: [
      /@/,
      'email имеет не правильный формат'
    ]
  },
  firstName: {
    required: [
      true,
      'требуется firstName'
    ],
    type: [
      'string',
      'firstName должен иметь тип string' 
    ],
    match: [
      /^[а-яА-ЯёЁa-zA-Z0-9]{1,12}$/,
      'firstName имеет не правильный формат'
    ]
  },
  lastName: {
    required: [
      true,
      'требуется lastName'
    ],
    type: [
      'string',
      'lastName должен иметь тип string' 
    ],
    match: [
      /^[а-яА-ЯёЁa-zA-Z0-9]{1,12}$/,
      'lastName имеет не правильный формат'
    ]
  }
});

exports.Password = schema({
  password: {
    required: [
      true,
      'требуется password'
    ],
    type: [
      'string',
      'password должен иметь тип string' 
    ],
    match: [
      /^[a-zA-Z][a-zA-Z0-9-_\.]{6,20}$/,
      'password должен иметь длину от 6 до 20 символов'
    ]
  }
});