var Q = require('q');

module.exports = function (data) {
  var deferred = Q.defer();
  deferred.resolve('Success!');
  return deferred.promise;
};
