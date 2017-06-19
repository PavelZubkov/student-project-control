'use strict';

const express = require('express');
const router = express.Router();
const log = require('../../libs/log.js')(module);
const db = require('../../libs/db.js').get();
const getProject = require('../../models/project/getProject.js').getProject;
const ObjectId = require('mongodb').ObjectId;
const Task = require('../../models/task');

router.get('/:id', function(req, res, next) {
  const id = new ObjectId(req.params.id);
  getProject(id, function(err, project) {
    if (err) {
      return next(err);
    }
      req.project = res.locals.project = project;
      for (let task of project.tasks) {
        if (task.dueDate) {
          task.dueDate.setDate(task.dueDate.getDate() + 1);
          task.dueDate = `${task.dueDate.getDate()}/${task.dueDate.getMonth()+1}/${task.dueDate.getFullYear()}`;
          // task.dueDate = `2/10/2017`;
        }
      }
      res.render('tasks', { title: 'Задачи'});
  });
});

router.post('/:id/create', function(req, res, next) {
  const id = new ObjectId(req.params.id);
  const name = req.body.name;
  Task.create(id, name, function(err) {
    if (err) {
      return next(err);
    }
    res.end();
  });
});

router.post('/:id/remove', function(req, res, next) {
  const projectId = new ObjectId(req.params.id);
  const taskId = req.body.id;
  Task.remove(projectId, taskId, function(err) {
    if (err) {
      return next(err);
    }
    res.end();
  });
});

router.post('/:id/get', function(req, res, next) {
  const projectId = new ObjectId(req.params.id);
  const taskId = req.body.id;
  Task.get(projectId, taskId, function(err, task) {
    if (err) {
      return next(err);
    }
    if (task.dueDate) {
      task.dueDate.setDate(task.dueDate.getDate() + 1);
      task.dueDate = `${task.dueDate.getDate()}/${task.dueDate.getMonth()+1}/${task.dueDate.getFullYear()}`;
      // task.dueDate = `2/10/2017`;
    }
    res.json(task);
  });
});

router.post('/:id/update', function(req, res, next) {
  const projectId = new ObjectId(req.params.id);
  const task = JSON.parse(req.body.task);
  const taskId = new ObjectId(task.id);
  delete task.id;
  
  let move;
  if (task.move) {
    move = parseInt(task.move);
    delete task.move;
  }
  if (task.dueDate) {
    task.dueDate = new Date(task.dueDate);

  }

  Task.update(
    projectId,
    taskId,
    task,
    function(err, doc) {
      if (err) {
        return next(err);
      }
      if (move !== undefined) {
        Task.move(projectId, taskId, move, function(err) {
          if (err) {
            return next(err);
          }
          res.end();
        });
        res.end();
      } else {
        res.end();
      }
    }
  );
});

router.post('/:id/copy', function(req, res, next) {
  const projectId = new ObjectId(req.params.id);
  const taskId = new ObjectId(req.body.id);
  Task.copy(projectId, taskId, function(err) {
    if (err) {
      return next(err);
    }
    res.end();
  });
});

module.exports = router;