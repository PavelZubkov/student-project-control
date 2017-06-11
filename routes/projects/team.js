'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const getProject = require('../../models/project/getProject.js').getProject;
const invite = require('../../models/project/invite.js').invite;
const kick = require('../../models/project/kick.js').kick;
const ObjectId = require('mongodb').ObjectId;

router.get('/:id', function(req, res, next) {
  getProject(req.params.id, function(err, project) {
    if (err) {
      return next(err);
    }
    req.project = res.locals.project = project;
    res.render('team', { title: 'Команда'});
  });
});

router.post('/:id/invite', function(req, res, next) {
  const id = new ObjectId(req.params.id);
  const email = req.body.email;
  console.log(id, email);
  invite(id, email, function(err) {
    if  (err) {
      return next(err);
    }
    res.status(200).end();
  });
});

router.post('/:id/kick', function(req, res, next) {
  const id = new ObjectId(req.params.id);
  const email = req.body.email;
  console.log(id, email);
  kick(id, email, function(err) {
    if  (err) {
      return next(err);
    }
    res.status(200).end();
  });
});

module.exports = router;