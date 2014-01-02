var options = require('./options');
var util = require('../util');
var Runner = require('./runner');

var runner = new Runner();
module.exports = runner.add.bind(runner);

module.exports.run = runner.run.bind(runner);

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
      var colors = require('mgutz-colors');
      options.passColor = colors.fn('green');
      options.failColor = colors.fn('red');
      options.headerColor = colors.fn('cyan');
    }
  } else {
    return options;
  }
}
