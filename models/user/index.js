// Собирает все модули в один
'use strict';

const auth = require('./auth.js').auth;
const get = require('./get.js').get;
const update = require('./update.js').update;
const remove = require('./remove.js').remove;
const save = require('./save.js').save;

module.exports = {
  auth: auth,
  get: get,
  update: update,
  remove: remove,
  save: save
};