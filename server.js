'use strict';

const app = require('express')();
const db = require('./libs/db.js');
const assert = require('assert');
const config = require('./config');
const log = require('./libs/log.js')(module);


db.connect(config.get('db:url'), function(err) {
  assert.ifError(err);
  require('./app.js')(app);
  log.info("Connected successfully to", config.get('db:url'));
  app.listen(config.get('port'), function() {
    log.info('Server started on', config.get('port'));
  });
});