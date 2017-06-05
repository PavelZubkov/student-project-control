'use strict';

module.exports = function(app) {
	app.use('/', require('./main.js'));
	app.use('/signin', require('./signin.js'));
	app.use('/signup', require('./signup.js'));
	app.use('/signout', require('./signout.js'));
};