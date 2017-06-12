'use strict';

const create = require('./create.js');
const remove = require('./remove.js');

const Task = {
  create: create,
  remove: remove
};

module.exports = Task;