const util = require('util');

exports.UserError = UserError;


function UserError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, UserError);

  this.message = message || 'Сообщение ошибки осутствует';
}

util.inherits(UserError, Error);
UserError.prototype.name = 'UserError';
