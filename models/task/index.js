'use strict';

const create = require('./create.js');
const remove = require('./remove.js');
const get = require('./get.js');
const update = require('./update.js');
const move = require('./move.js');

const Task = {
  create: create,
  remove: remove,
  get: get,
  update: update,
  move: move
};

module.exports = Task;