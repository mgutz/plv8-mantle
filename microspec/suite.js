var options = require('./options');
var util = require('../util');
var stackTrace = require('./stackTrace').stackTrace;
var AssertionError = require('assert').AssertionError;
var Nimble = require('../vendor/nimble');

// these are set only if options.colorful(true) is called
var IGNORE = '#';
var PENDING = '_';
var ONLY = '+';
var runner = require('./runner');

function checkGlobals(moreGlobals) {
  var global = (function(){ return this; }).call(null);
  var allGlobals = options.globals.concat(moreGlobals);
  var summary = [];
  Object.keys(global).forEach(function(p) {
    if (allGlobals.indexOf(p) < 0) {
      summary.push(p);
    }
  });
  return summary;
};

function gatherTestCases(tests) {
  var name, fn;
  var before, after;
  var subset = [];
  var set = [];
  if (typeof tests === 'function') {
    set.push({name: '(anonymous)', fn: tests});
  } else {
    for (name in tests) {
      fn = tests[name];
      if (name === 'before') {
        before = fn;
      } else if (name === 'after') {
        after = fn;
      } else if (name[0] === ONLY) {
        subset.push({name: name, fn: tests[name]});
      } else if (name[0] === IGNORE) {
        continue;
      } else {
        set.push({name: name, fn: tests[name]});
      }
    }
  }

  if (subset.length > 0) set = subset;
  if (before) {
    set.unshift({name: 'before', fn: before});
  }
  if (after) {
    set.push({name: 'after', fn: after});
  }
  return set;
}

exports.run = function(group, tests, cb) {
  if (group[0] === IGNORE) return;
  var opts = {};
  var pendingGroup;
  if (group[0] === PENDING) {
    pendingGroup = true;
    group = '(PENDING) ' + group.slice(1);
  }

  var summary = ['', options.colorful ?  options.headerColor(group) : group];

  if (pendingGroup) {
    console.log(summary.join('\n'));
    return;
  }

  var set = gatherTestCases(tests);
  var ran = 0, pending = 0, name, message;

  Nimble.eachSeries(set, function(test, cb) {
    function next(fn) {
      function done(err) {
        if (err) return cb(err);
        if (options.colorful) {
          var last = summary[summary.length - 1];
          summary[summary.length-1] = options.passColor(last);
        }
        cb();
      }
      if (fn) {
        try {
          if (fn.length === 1) {
            fn(done);
          } else {
            fn();
            done();
          }
        } catch(e) {
          done(e);
        }
      } else {
        done();
      }
    }

    name = test.name;
    var testCase = test.fn;
    if (name[0] === PENDING) {
      summary.push('  - (PENDING) ' + name.slice(1));
      pending += 1;
      next();
    } else if (!testCase) {
      summary.push('  - (PENDING) ' + name);
      pending += 1;
      next();
    } else if (name[0] === ONLY) {
      summary.push('  - ' + name.slice(1));
      ran += 1;
      next(testCase);
    } else if (name === 'before' || name === 'after') {
      next(testCase);
    } else {
      summary.push('  - ' + name);
      ran += 1;
      next(testCase);
    }

  }, function(err) {
    if (err) {
      if (err.stack) {
        message = stackTrace(err.stack).message;
      } else {
        message = err.toString();
      }

      if (options.colorful) {
        var last = summary[summary.length - 1];
        summary[summary.length-1] = options.failColor(last);
        summary.push(options.failColor(message));
      } else {
        summary.push(message);
      }
    } else {
      message = '  ran ' + ran + ' specs';
      if (pending > 0) message += ' (' + pending + ' pending)';
      summary.push(message);

      var leaks = checkGlobals(opts.globals);
      if (leaks.length > 0) {
        leaks = '\nGlobal variable leaks: ' + leaks.join(', ');
        summary.push(options.colorful ? options.failColor(leaks) : leaks);
      }
    }
    console.log(summary.join('\n'));
    cb();
  });

};



