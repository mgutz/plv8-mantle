var options = require('./options');
var util = require('../util');
var stackTrace = require('./stackTrace').stackTrace;
var AssertionError = require('assert').AssertionError;

// these are set only if options.colorful(true) is called
var colors, failColor, headerColor, passColor;
var IGNORE = '#';
var PENDING = '_';
var ONLY = '+';

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


module.exports = runSuite;


function runSuite(group, opts, tests) {
  if (group[0] === IGNORE) return;
  if (arguments.length === 2) {
    tests = opts;
    opts = {};
  }

  var name, fn, total, only, message;
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

  var ran = 0, pending = 0;

  if (subset.length > 0) set = subset;
  var pendingGroup;
  if (group[0] === PENDING) {
    pendingGroup = true;
    group = '(PENDING) ' + group.slice(1);
  }

  var summary = ['', options.colorful ?  headerColor(group) : group];

  if (pendingGroup) {
    console.log(summary.join('\n'));
    return;
  }

  try {
    if (before) before();
    var i, test, testCase;
    for (i = 0; i < set.length; i++) {
      test = set[i];
      name = test.name;
      testCase = test.fn;
      if (name[0] === PENDING) {
        summary.push('  - (PENDING) ' + name.slice(1));
        pending += 1;
      } else if (name[0] === ONLY) {
        summary.push('  - ' + name.slice(1));
        testCase();
        ran += 1;
      } else {
        summary.push('  - ' + name);
        testCase();
        ran += 1;
      }

      if (options.colorful) {
        var last = summary[summary.length - 1];
        summary[summary.length-1] = passColor(last);
      }
    }
    if (after) after();

    message = '  ran ' + ran + ' specs';
    if (pending > 0) message += ' (' + pending + ' pending)';
    summary.push(message);

    var leaks = checkGlobals(opts.globals);
    if (leaks.length > 0) {
      leaks = '\nGlobal variable leaks: ' + leaks.join(', ');
      summary.push(options.colorful ? failColor(leaks) : leaks);
    }
  } catch(e) {
    if (e.stack) {
      message = stackTrace(e.stack).message;
    } else {
      message = e.message;
    }

    if (options.colorful) {
      var last = summary[summary.length - 1];
      summary[summary.length-1] = failColor(last);
      summary.push(failColor(message));
    } else {
      summary.push(message);
    }
  }

  console.log(summary.join('\n'));
};

/**
 * Add global var exclusions, used by `checkGlobals`
 */
module.exports.addGlobals = function(arr) {
  options.globals = options.globals.concat(arr);
};

/**
 * Extend options.
 */
module.exports.options = function(opts) {
  if (arguments.length === 1) {
    util.extend(options, opts);
    if (options.colorful) {
      colors = require('mgutz-colors');
      passColor = colors.fn('green');
      failColor = colors.fn('red');
      headerColor = colors.fn('cyan');
    }
  } else {
    return options;
  }
}
