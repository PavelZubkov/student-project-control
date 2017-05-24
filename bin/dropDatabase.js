const db = require('../libs/db.js').get();
const log = require('../libs/log.js')(module);
const config = require('../config');
const assert = require('assert');

module.exports = function(cb) {
  db.dropDatabase(function(err, result) {
    cb(err, result);
  });
}