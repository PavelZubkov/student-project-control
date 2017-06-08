'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const copy = require('../../models/project/copy.js').copy;

router.post('/', function(req, res, next) {
  const id = req.body.projectId;
  copy(id, function(err) {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
});

module.exports = router;