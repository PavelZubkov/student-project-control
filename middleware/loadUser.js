/*
	Если пользователь авторизован
		req.session.user существует
	то
		добавляет в объект запроса req
		данные пользователя из БД
		т.е. в шаблонизаторе доступен объект user и его свойства
	в req.session.user храниться objectId пользователя
*/
const User = require('../models/user');

module.exports = function(req, res, next) {
	if (!req.session.userId) {
		return next();
	}

	User.get(req.session.userId, function(err, user) {
		if (err) {
			return next(err);
		}

		req.user = res.locals.user = user;
		next();
	});
};