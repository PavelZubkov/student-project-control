'use strict';

const create = require('./create.js');
const remove = require('./remove.js');
const get = require('./get.js');

const Task = {
  create: create,
  remove: remove,
  get: get
};

module.exports = Task;