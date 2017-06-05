var express = require('express');
var router = express.Router();
var log = require('../libs/log.js')(module);
var User = require('../models/user').User;
var AuthError = require('../error').AuthError;
var HttpError = require('../error').HttpError;

/* GET login page. */
router.get('/', function(req, res, next) {
	res.render('login');
});

router.post('/', function(req, res, next) {
	var email = req.body.email;
	var password = req.body.password;

	User.authorize(email, password, function(err, user) {
		if (err) {
			if (err instanceof AuthError) {
				return next(new HttpError(403, err.message));
			} else {
				return next(err);
			}
		}

		req.session.user = user._id;
		res.redirect('/');
	});

});

module.exports = router;
