'use strict';

const schema = require('validate');
const ObjectId = require('mongodb').ObjectId;

const name = schema({
  name: {
    required: [true, 'Параметр name не передан'],
    type: ['string', 'Параметр name должен иметь тип string'],
    match: [
      /^[а-яА-ЯёЁa-zA-Z0-9-_\. ]{1,20}$/,
      'Название должно иметь формат /^[а-яА-ЯёЁa-zA-Z0-9-_\.]{1,20}$/'
    ]
  }
});

const description = schema({
  description: {
    required: [true, 'Параметр description не передан'],
    type: ['string', 'Параметр description должен иметь тип string'],
    match: [
      /[^><]{1,500}/,
      'Параметр description должен иметь формат /[^><]{1,500}/'
    ]
  }
});

const members = schema({
  members: {
    required: [true, 'Параметр members не передан'],
    type: ['array', 'Парметр members должен быть массивом'],
    each: [
      ObjectId.isValid,
      'Элементы массива members должны иметь тип ObjectId'
    ],
    use: [
      function(members) {
        if (members.length < 100) {
          return true;
        }
      },
      'Массив members должен быть меньше 100 элементов'
    ]
  }
});

const dueDate = schema({
  dueDate: {
    required: [true, 'Параметр dueDate не передан'],
    type: ['date', 'Параметр dueDate должен быть датой']
  }
});

const state = schema({
  state: {
    required: [true, 'Параметр state не передан'],
    type: ['string', 'Параметр state должен иметь тип string'],
    match: [
      /(Черновик|В очереди|Выполнено|Завершено)/,
      'Параметр state должен иметь одно из значений: "Черновик", "В очереди", "Выполнено", "Завершено"'
    ]
  }
});

const Task = {
  name: name,
  description: description,
  members: members,
  dueDate: dueDate,
  state: state
};

/**
 * Валидация полей name, description, members, dueDate, state
 * 
 * @param {Object} task объект с проверяемыми полями
 * @param {Array} options Опциональный, если указан, то будут проверятся
 * только указанные в нем поля
 */
module.exports = function validate(task, options) {
  if (!options) {
    options = ['name', 'description', 'members', 'dueDate', 'state'];
  } else {
    if (!Array.isArray(options)) {
      throw new Error('Параметр Options должен быть массивом');
    }
    for (let prop of options) {
      if (
        prop !== 'name' &&
        prop !== 'description' &&
        prop !== 'members' &&
        prop !== 'dueDate' &&
        prop !== 'state'
      ) {
        throw new Error(`Опечатка в названии свойства ${prop}`);
      }
    }
  }
  
  for (let prop of options) {
    let error = Task[prop].validate( { [prop]: task[prop] });
    if (error.length) {
      return error[0];
    }
  }
};