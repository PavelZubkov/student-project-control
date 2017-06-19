'use strict';

const express = require('express');
const router = express.Router();
const log = require('../libs/log.js')(module);
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');

router.get('/', function(req, res, next) {
  res.render('feedback');
});

router.post('/', function(req, res, next) {
  const theme = req.body.theme;
  const message = req.body.message;
  const date = new Date();
  const user = res.locals.user;
  const author = `${user.firstName} ${user.lastName}, email: ${user.email}`;
  fs.appendFile(
    'feedback.txt',
    `${date} theme: ${theme}
     from: ${author}
     message: ${message}`,
    function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    }
  );
});

module.exports = router;