'use strict';

const db = require('../../libs/db.js');
const crypto = require('crypto');
const validatorEmail = require('validator').isEmail;

exports.save = save;
/**
 * Сохраняет пользователя в БД.
 * 	1. Проверяет валидность данных нового пользователя.
 * 	2. Добавляет недостающие поля.
 * 	3. Вставляет запись в БД. 
 *
 * Описание полей в README
 * 
 * @param  {Object}   user Объект с данными о новом пользователе, содержит поля:
 *                         username, 
 *                         password,
 *                         email,
 *                         firstName ,
 *                         lastName.
 * @param  {Function} cb   Вызывает перед завершением функции create с параметрами:
 *                         err - {Error} или {null},
 *                         id {ObjectId} - _id пользователя в базе
 *
 */
function save(user, cb) {
	if (!user) {
		throw new Error('user не передан');
	}
	if (typeof user !== 'object' || user === null) {
		throw new Error('user должен быть объектом');
	}
	if (!cb) {
		throw new Error('колбек не передан');
	}
	if (typeof cb !== 'function') {
		throw new Error('колбек должен быть функцией');
	}

 	validate(user, function(err, user) {
		if (err) {
			return cb(err);
		}
		user = prepare(user);
		insert(user, function(err, id) {
			if (err) {
				return cb(err);
			}
			return cb(null, id);
		});
	});
}


function insert(user, cb) {
	db.get().collection('users', function(err, users) {
    if (err) {
      return cb(err);
    }
    users.insertOne(user, function(err, result) {
    	if (err) {
    		return cb(err);
    	}
    	if (result.insertedCount !== 1) {
    		return cb(new Error('новый пользователь не сохранен'));
    	}
    	return cb(null, result.insertedId);
    });
  });
}

/**
 * Проверка на типы и формат
 * 	на уникальность
 */
function validate(user, cb) {
	isApproriateFormat(user, function(err) {
		if (err) {
			return cb(err);
		}
		// поля username и email уникальные
		isUnique(user.username, user.email, function(err) {
			if (err) { 
				return cb(err);
			}
			return cb(null);
		});
	});
}

function isUnique(username, email, cb) {
	db.get().collection('users', function(err, users) {
    if (err) {
      return cb(err);
    }
    const query = {
      $or: [
      	{
      		username: username
      	},
      	{
      		email: email
      	}
      ]
    };
    users.findOne(query, {
      fields: {
        username: 1,
        email: 1
      }
    }, function(err, res) {
      if (err) {
        return cb(err);
      }
      if (res.username === username) {
        return cb(new Error('username занят'));
      } else if (res.email === email) {
      	return cb(new Error('email занят'));
      }
      return cb(null);
    });
  });
}

/**
 * Проверка формата
 */
function isApproriateFormat(user, cb) {
	const properties = ['username', 'password', 'email', 'firstName', 'lastName'];
	for (let i = 0; i < properties.length; i++) {
		let property = properties[i]; // Название свойства
		let value = user[property]; // Значение свойства
		let range; // Ограничение длины свойства
		if (property === 'email') {
			range = { min: 5, max: 40 };
		} else if (property === 'password'){
			range = { min: 6, max: 12 };
		} else {
			range = { min: 1, max: 12 };
		}

		if 
	}
	return false // Все ок
}

// function isChainExistStringRange(param, nameParam, range, cb) {
// 	for(let i=0; i<100000; i+=0.01) {
// 		i-=0.001;
// 	}
// 	return 1;
// 	isExist(param, `требуется ${nameParam}`, function(err) {
// 		if (err) {
// 			return cb(err);
// 		}
// 		isString(param, `${nameParam} должен иметь тип string`, function(err) {
// 			if (err) {
// 				return cb(err);
// 			}
// 			let range = isCorrectRange(param,
// 				`длина ${nameParam} должна быть от ${range.min} до ${range.max} символов включительно`, 
// 				range);
// 			if (!range) {
// 				new Error()
// 			}
// 		});
// 	});
// }

/**
 * Добавляет необходимые поля
 */
function prepare(user) {
	user.initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
	user.project = [];
	user.hashedPassword = encryptPassword(user.password);
	delete user.password;
	return user;
}

/**
 * Хеширует пароль
 */
function encryptPassword(password) {
	const salt = Math.random() + '';
	const hashedPassword = crypto.createHmac('sha1', salt).update(password).digest('hex');
	return hashedPassword;
}