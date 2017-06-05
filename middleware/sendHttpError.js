var log = require('../libs/log.js')(module);
module.exports = function(req, res, next) {
	res.sendHttpError = function(error) {
		log.debug(error);
		res.status(error.status || 500);
		if (res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
			res.json(error);
		} else {
			res.render('error', {error: error});
		}
		log.debug('sendHttpError ok');
		debugger;
	};

	next();
};