var express = require('express');
var router = express.Router();
var log = require('../libs/log.js')(module);
var User = require('../models/user').User;
var Project = require('../models/project').Project;

var async = require('async');

// GET '/projects' - отдает массив проектов, со всеми данными 
router.get('/', function(req, res, next) {
	if (!req.session.user) return next(); // Не известно от кого
	if (!req.xhr) return next(); // Не ajax
	// log.info('Запрос пришел');
	// Project.getListAllId(function(err, list) {
	// 	if (err) return console.log(err);
	// 	User.bindUserAndProjects(req.session.user, list, function(err) {
	// 		log.debug(err);
	// 	});
	// });

	Project.getListProjects(req.user.projects, function(err, projects) {
		if (err) {
			log.debug(err);
			res.status(500).end();
			return next();
			// return next(err);
		}
			// log.debug(projects);
			res.status(200);
			res.json(projects);
	});
});


/* POST '/projects' - 
	1 получает название проекта
	2 создает новый проект в БД
	3 привязывает к нему текущего пользователя
	4 к текущему пользователю привязывает этот проект
*/

router.post('/', function(req, res, next) {
	if (!req.session.user) return next();
	var id,
		newProject = {
			name: req.body.name
		};
	project = new Project(newProject);
	id = project._id;
	project.team.push(req.session.user);
	project.save(function(err){
		if (err) return next(err);
		req.user.projects.push(id);
		req.user.save(function(err) {
			if (err) return next(err);
			res.status(200).end();
		});
	});	
});

// Если это запрос от браузера - рендер страницы
// Если это запрос от скрипта - не обрабатывать, обработка в следующем роуте
router.get('/:id', function(req, res, next) {
	// console.log(req.headers);
	if (!req.session.user) return next(); // Не авторизован - лесом
	if (req.xhr) {
		Project.findById(req.params.id, function(err, doc) {
			if (err) return next(err);
			res.json(doc);
		});
		return;
	}



	// Если у этого пользователя есть этот проект
 	// Если запрос принадлежит не скрипту
	res.render('task'); // Отдаем страницу

});
module.exports = router;