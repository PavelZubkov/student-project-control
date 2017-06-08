const getProject = require('../models/project/getProject').getProject;

module.exports = function(req, res, next) {
	if (!req.session.project) {
		return next();
	}

  getProject(req.session.project.id, function(err, project) {
    if (err) {
      return next(err);
    }
    
    req.project = res.locals.project = project;
    next();
  });
};