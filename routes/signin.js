'use strict';

const express = require('express');
const router = express.Router();
const log = require('../libs/log.js')(module);
const User = require('../models/user');

router.get('/', function(req, res, next) {
	res.render('signin');
});

router.post('/', function(req, res, next) {
	const username = req.body.username;
	const password = req.body.password;
	if (!username || !password) {
		return next(new Error('Заполнены не все поля'));
	}
	User.auth(username, password, function(err, id) {
		if (err) {
			return next(err);
		}
		req.session.userId = id;
		res.status(200).redirect('/');
	});
});

module.exports = router;