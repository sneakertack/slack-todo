var fs = require('fs');
var Q = require('q');

var defaultText = fs.readFileSync(__dirname+'/slackSlashTodoHelp.txt', {encoding: 'utf8'});

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
        deferred.resolve(todoAdd(slashObject));
      } else {
        deferred.resolve(defaultText);
      }
  }

  return deferred.promise;
};

function todoAdd() {}
function todoList() {}
function todoClear() {}
