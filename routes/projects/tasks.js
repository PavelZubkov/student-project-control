'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const getProject = require('../../models/project/getProject.js').getProject;
const ObjectId = require('mongodb').ObjectId;

router.get('/:id', function(req, res, next) {
  const id = new ObjectId(req.params.id);
  getProject(id, function(err, project) {
    if (err) {
      return next(err);
    }
    req.project = res.locals.project = project;
    res.render('tasks', { title: 'Задачи'});
  });
});

module.exports = router;