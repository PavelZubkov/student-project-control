'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const getProject = require('../../models/project/getProject.js').getProject;

router.get('/:id', function(req, res, next) {
  getProject(req.params.id, function(err, project) {
    if (err) {
      return next(err);
    }
    req.project = res.locals.project = project;
    res.render('team', { title: 'Команда'});
  });
});

module.exports = router;