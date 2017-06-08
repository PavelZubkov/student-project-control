'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const remove = require('../../models/project/remove.js').remove;

router.post('/', function(req, res, next) {
  const projectId = req.body.projectId;
  remove(projectId, function(err) {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
});

module.exports = router;