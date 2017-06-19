'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const getProject = require('../../models/project/getProject.js').getProject;
const ObjectId = require('mongodb').ObjectId;
const db = require('../../libs/db.js').get();

router.get('/:id', function(req, res, next) {
  getProject(req.params.id, function(err, project) {
    if (err) {
      return next(err);
    }
    req.project = res.locals.project = project;
    res.render('info', { title: 'Описание'});
  });
});

router.post('/:id', function(req, res, next) {
  const projectId = new ObjectId(req.params.id);
  const description = req.body.description;
  db.projects.findOneAndUpdate({
    _id: projectId
  }, {
    $set: { description: description }
  },
  function(err, r) {
    if (err) {
      return next(err);
    }
    res.end();
  });
});

module.exports = router;