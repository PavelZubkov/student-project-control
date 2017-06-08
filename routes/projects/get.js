'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const get = require('../../models/project/get.js').get; 

router.post('/', function(req, res, next) {
  const userId = req.session.userId;
  get(userId, function(err, projects) {
    if (err) {
      return next(err);
    }
    res.status(200).json(projects);
  });
  // const projects = [ { name: 'Автоматизация буфета', id: 1 }, { name: 'Оптимизация гардероба', id: 2 } ];
});

module.exports = router;