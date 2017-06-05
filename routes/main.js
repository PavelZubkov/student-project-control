'use strict';

var express = require('express');
var router = express.Router();
var log = require('../libs/log.js')(module);

router.get('/', function(req, res, next) {
  console.log(res.locals.user);
	res.render('main');
});

module.exports = router;