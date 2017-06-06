'use strict';

const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
	if (!req.session.userId) {
	  res.redirect('/signin');  
	}
	res.render('profile');
});

module.exports = router;