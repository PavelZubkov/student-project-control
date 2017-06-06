'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ObjectId = require('mongodb').ObjectId;

router.get('/', function(req, res, next) {
	if (!req.session.userId) {
	  res.redirect('/signin');  
	}
	res.render('profile');
});

router.post('/', function(req, res, next) {
	if (!req.session.userId) {
		res.redirect('/signin'); // перенести это и остальные подобные редиректы, в отдельную функцию middleware
	}
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

module.exports = router;