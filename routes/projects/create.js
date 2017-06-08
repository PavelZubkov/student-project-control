'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const create = require('../../models/project/create.js').create; 

router.post('/', function(req, res, next) {
	const name = req.body.name;
	create(name, req.session.userId, function(err, id) {
	  if (err) {
	    return next(err);
	  }
  	res.status(200).end();
	});
});

module.exports = router;