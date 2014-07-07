var fs = require('fs');
var Q = require('q');

var defaultText = fs.readFileSync(__dirname+'/slackSlashTodoHelp.txt', {encoding: 'utf8'});

var MongoClient = require('mongodb').MongoClient;
var dbUp = Q.ninvoke(MongoClient, 'connect', process.env.MONGOLAB_URI); // Returns mongodb as a promise.

module.exports = function (slashObject) {
  var deferred = Q.defer();

  // Extract command from the data string.
  slashObject.todoData = slashObject.text.split(' ');
  slashObject.todoCommand = slashObject.todoData.shift();
  slashObject.todoData = slashObject.todoData.join(' ');

  switch (slashObject.todoCommand) {
    case 'add':
      deferred.resolve(todoAdd(slashObject));
      break;
    case 'show':
    case 'list':
    case 'ls':
      deferred.resolve(todoList(slashObject));
      break;
    case 'clear':
    case 'x':
      deferred.resolve(todoClear(slashObject));
      break;
    default:
      if (slashObject.todoData.trim().length > 0) {
        slashObject.todoData = slashObject.todoCommand+' '+slashObject.todoData;
        deferred.resolve(todoAdd(slashObject));
      } else {
        deferred.resolve(defaultText);
      }
  }

  return deferred.promise;
};

function todoAdd(s) {
  return dbUp.then(function (db) {
    return Q.ninvoke(db.collection('todos'), 'insert', {
      user: s.user_name,
      todo: s.todoData,
      createdAt: new Date()
    });
  }).then(function (docs) {
    return 'Todo added. Use \'/todo ls\' to show.';
  });
}

function todoList(s) {
  var deferred = Q.defer();

  return deferred.promise;
}

function todoClear(s) {
  var deferred = Q.defer();

  return deferred.promise;
}
