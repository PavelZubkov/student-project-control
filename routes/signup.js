'use strict';

var express = require('express');
var router = express.Router();
var log = require('../libs/log.js')(module);
var User = require('../models/user');

router.get('/', function(req, res, next) {
  res.render('signup', { title: 'Регистрация'} );
});

router.post('/', function(req, res, next) {
  const user = {};
  const props = ['username', 'password', 'email', 'firstName', 'lastName'];
  for (let prop of props) {
    if (!req.body[prop]) {
      return next(new Error('Заполнены не все поля'));
    }
    user[prop] = req.body[prop];
  }
  User.save(user, function(err, id) {
    if (err) {
      return next(err);
    }
    res.redirect('/signin');
  });
});

module.exports = router;
