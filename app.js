'use strict';

const db = require('./libs/db.js');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const exphbs  = require('express-handlebars');
const helpers = require('handlebars-helpers')();
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const log = require('./libs/log')(module);

module.exports = function (app) {
  
  // app.enable('view cache');
  
  var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: helpers,
    defaultLayout: 'main'
  });
  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.use(session({
    secret: 'foo',
    resave: false,
  	saveUninitialized: true,
    store: new MongoStore( { db: db.get().db } )
  }));

  app.use(require('./middleware/loadUser.js'));
  //Маршруты
  require('./routes')(app);
  
  //Не один маршрут не совпал
  app.use(function(req, res, next) {
  	res.type('text/plain');
  	res.status(404);
  	res.send('404 — Не найдено');
  });
  
  // app.use(function(err, req, res, next) {
  //   log.debug(err);
  //   req.session.destroy();
  //   res.status(500).end(err);
  // });



//   app.use(function(err, req, res, next) {
// 	if (typeof err == 'number') {
// 		err = new HttpError(err);
// 	}

// 	if (err instanceof HttpError) {
// 		res.sendHttpError(err);
// 	} else {
// 		if ( app.get('env') == 'development' ) {
// 			log.error(err);
// 			res.status(500).end();
// 		} else {
// 			log.error(err);
// 			err = new HttpError(500);
// 			res.sendHttpError(err);
// 		}
// 	}
// });

};