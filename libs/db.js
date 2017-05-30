const MongoClient = require('mongodb').MongoClient;

const mongo = {
  db: null,
  users: null
};

exports.connect = function (url, done) {
  if (mongo.db) {
    return done();
  }

  MongoClient.connect(url, function (err, db) {
    if (err) {
      return done(err);
    }
    mongo.db = db;
    db.collection('users', function(err, users) {
      if (err) { 
        throw err;
      }
      mongo.users = users;
      done();
    });
  });
}

exports.get = function () {
  return mongo;
}