/*
	'/feed'
	новости проекта, изменения и т.п.
*/
var express = require('express');
var router = express.Router();
var log = require('../libs/log.js')(module);

router.get('/', function(req, res, next) {
	res.render('feed');
});

module.exports = router;