const db = require('../libs/db.js');
const log = require('../libs/log.js')(module);
const config = require('../config');
const assert = require('assert');

db.connect(config.get('db:url'), function(err) {
  assert.ifError(err);
  log.info("Connected successfully to", config.get('db:url'));
  require('./dropDatabase.js')(function(err, result) {
    assert.ifError(err);
    assert.ok(result);
    log.info("Database dropped");
  });
});