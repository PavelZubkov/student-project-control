'use strict';

const create = require('./create.js');
const remove = require('./remove.js');
const get = require('./get.js');
const update = require('./update.js');
const move = require('./move.js');
const getAll = require('./getAll.js');
const copy = require('./copy.js');

const Task = {
  create: create,
  remove: remove,
  get: get,
  update: update,
  move: move,
  getAll: getAll,
  copy: copy
};

module.exports = Task;