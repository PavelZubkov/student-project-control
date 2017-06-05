// Этот модуль собирает все обработчики путей в одном месте

/*
	/					- список проектов, авторизованного пользователя, не авторизованный редирект на /feed
	/feed				- новости проекта, изменения и т.п.
	/profile			- просмотр и изменение профиля
	/projects/:id		- список задач проекта :id
	/projects/:id/info	- просмотр и изменение информации проекта - цель, описание т.п.
	/projects/:id/team	- список участников проекта, дроп из проекта, для создателя - кик участников
	/projects/:id/settings - настройки проекта
	/feedback			- обратная связь пользователей
	/signup				- регистрация
	/signin				- вход
	/events				- список событий - вас пригласили в проект, вам назначили задание, Вася П. выполнил задание и т.п.
*/
module.exports = function(app) {
	app.use('/', require('./main'));
	app.use('/feed', require('./feed'));
	app.use('/signin', require('./signin'));
	app.use('/logout', require('./logout'));
	app.use('/signup', require('./signup'));
	app.use('/projects', require('./projects'));
	app.use('/projects', require('./tasks'));
	app.use('/user', require('./users'));
};