var express = require('express');
var router = express.Router();
var User = require('../models/user').User;
var HttpError = require('../error').HttpError;
var ObjectID = require('mongodb').ObjectID;
var log = require('../libs/log.js')(module);

/* GET users listing. */
router.post('/names', function(req, res, next) {
	var ids = req.body.ids ? JSON.parse(req.body.ids) : [];
	if (!ids.length) {
		log.debug('ids is empty');
		res.status(400).json({"error": "ids is empty"});
		return;
	}

	var query = User.find({ _id : { $in : ids } });
	query.select('name surname');

	var result = [];
	query.exec(function(err, users) {
		if (err) {
			log.debug(err);
			return next(err);
		}
		for (var i = 0; i < users.length; i++) {
			result.push(users[i].name + ' ' + users[i].surname);
		}
		res.json(result);
		console.log('запрос-ответ', result);
	});
});

router.get('/:id', function(req, res, next) {
	try {
		var id = new ObjectID(req.params.id);
	} catch (e) {
		next(404);
		return;
	}
	User.findById(id, function(err, user) {
		if (err) return next(err);
		if (!user) {
			next(new HttpError(404, 'User not found'));
		} else {
			res.json(user);
		}
	});
});

module.exports = router;
