'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ObjectId = require('mongodb').ObjectId;

router.get('/', function(req, res, next) {
	res.render('profile', { title: 'Профиль'} );
});

router.post('/', function(req, res, next) {
	const user = {};
  const props = ['username', 'oldPassword', 'newPassword', 'email', 'firstName', 'lastName', 'initials'];
  for (let prop of props) {
    if (req.body[prop]) {
      user[prop] = req.body[prop];
    }
  }
  user.id = new ObjectId(req.session.userId);
  User.update(user, function(err) {
  	if (err) {
  		next(err);
  	}
		res.status(200).redirect('/profile');
  });
});

router.post('/destroy', function(req, res, next) {
	const id = new ObjectId(req.session.userId);
	const password = req.body.password;
	console.log(id, password);
	User.remove(id, password, function(err) {
		if (err) {
			return next(err);
		}
		req.session.destroy();
		res.status(200).end();
	});
});
module.exports = router;