var fs = require('fs');
var Q = require('q');
var _ = require('lodash');

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
    case 'help':
      deferred.resolve(defaultText);
      break;
    default:
      if (slashObject.todoData.trim().length > 0) {
        slashObject.todoData = slashObject.todoCommand+' '+slashObject.todoData;
        deferred.resolve(todoAdd(slashObject));
      } else {
        deferred.resolve(todoList(slashObject).then(function (ls) {
          return ls+'\nType \'/todo help\' to see commands.\n';
        }));
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
    return 'Added todo (type \'/todo\' to show).';
  });
}

function todoList(s) {
  var response = {
    data: '',
    append: function (str) {
      response.data += str+'\n';
    }
  };
  return dbUp.then(function (db) {
    return Q.ninvoke(db.collection('todos').find(), 'toArray');
  }).then(function (todos) {
    usersTodos = _.groupBy(todos, function (todo) {
      return todo.user;
    });
    _.forOwn(usersTodos, function (todos, userName) {
      response.append('*'+userName+':*');
      todos.forEach(function (todo, index) {
        response.append(''+(index + 1)+'. '+todo.todo);
      });
      response.append('');
    });
    return response.data;
  });
}

function todoClear(s) {
  var db, targetUserTodos, targetTodo;
  return dbUp.then(function (x) {
    db = x;
    return Q.ninvoke(db.collection('todos').find(), 'toArray');
  }).then(function (todos) {
    usersTodos = _.groupBy(todos, function (todo) {
      return todo.user;
    });
    var targetIndex = parseInt(s.todoData.trim(), 10) - 1;
    if (_.isNaN(targetIndex)) throw new Error('Please enter a numeric todo ID (0-9).');
    targetUserTodos = usersTodos[s.user_name] || [];
    targetTodo = targetUserTodos[targetIndex];
    if (!(targetTodo || {})._id) throw new Error('You don\'t have a todo with id '+(targetIndex+1)+'!');
    return Q.ninvoke(db.collection('todos'), 'remove', {_id: targetTodo._id}, 1);
  }).then(function (docs) {
    var qty = targetUserTodos.length - 1 > 0 ? targetUserTodos.length - 1 : 'no';
    var todoPlural = targetUserTodos.length === 2 ? 'todo' : 'todos';
    return 'Cleared \''+targetTodo.todo+'\'. You have '+qty+' '+todoPlural+' left.';
  });
}
