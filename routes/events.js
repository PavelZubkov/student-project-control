'use strict';

const express = require('express');
const router = express.Router();
const log = require('../libs/log.js')(module);
const ObjectId = require('mongodb').ObjectId;

router.get('/', function(req, res, next) {
  res.render('events');
});

module.exports = router;