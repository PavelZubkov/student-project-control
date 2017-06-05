/*
	'/'
	ЕСЛИ юзер авторизован ТО
		отдает страницу со списком проектов
	ИНАЧЕ
		редирект на /feed
*/
var express = require('express');
var router = express.Router();
var log = require('../libs/log.js')(module);

router.get('/', function(req, res, next) {
	if (req.session.user) {
		res.render('userProjects');
	} else {
		res.redirect('/feed');
	}
});

module.exports = router;