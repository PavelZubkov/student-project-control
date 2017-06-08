'use strict';

module.exports = function(app) {
	app.use('/', require('./main.js'));
	app.use('/signin', require('./signin.js'));
	app.use('/signup', require('./signup.js'));
	app.use('/signout', require('./signout.js'));
	app.use('/profile', require('./profile.js'));
	app.use('/projects/create', require('./projects/create.js'));
	app.use('/projects/get', require('./projects/get.js'));
	app.use('/projects/remove', require('./projects/remove.js'));
	app.use('/projects/copy', require('./projects/copy.js'));
	app.use('/projects/tasks', require('./projects/tasks.js'));
	app.use('/projects/info', require('./projects/info.js'));
	app.use('/projects/team', require('./projects/team.js'));
	app.use('/events', require('./events.js'));
	app.use('/userguide', require('./userguide.js'));
	app.use('/feedback', require('./feedback.js'));
};