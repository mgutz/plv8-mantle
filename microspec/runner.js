var suite = require('./suite');
var IGNORE = '#';
var PENDING = '_';
var ONLY = '+';
var Nimble = require('../vendor/nimble');

function Runner(suites) {
  this.suites = [];
}

Runner.prototype.add = function(name) {
  this.suites.push({ name: name, args: Array.prototype.slice.apply(arguments)});
  return this;
};

Runner.prototype.run = function() {
  var i, testSuite;
  var set = [];
  var subset = [];
  for (i = 0; i < this.suites.length; i++) {
    testSuite = this.suites[i];
    var name = testSuite.name;
    if (name[0] === ONLY) {
      subset.push(testSuite);
    } else {
      set.push(testSuite);
    }
  }

  if (subset.length > 0) {
    set = subset;
  }

  Nimble.eachSeries(set, function(testSuite, cb) {
    testSuite.args.push(cb);
    suite.run.apply(suite, testSuite.args);
  }, function(err) {
    if (err) console.log(err.toString());
  });
};


module.exports = Runner;
