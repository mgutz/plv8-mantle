/**
 * Module dependencies.
 */

var AssertionError = require('assert').AssertionError
  , callsite = require('callsite');

/**
 * Expose `assert`.
 */

module.exports = assert;
// adjust for plv8_startup preamble
module.exports.SOURCE_LINE_OFFSET = 0;

/**
 * Assert the given `expr`.
 */

function assert(expr) {
  if (expr) return;

  var stack = callsite();

  //var src = fs.readFileSync(file, 'utf8');
  var code = plv8.__executeScalar("select code from plv8_sources where filename = 'plv8_startup'");
  var lines = code.split('\n');
  if (code) {
    function getCodeContext(lineno, n) {
      var i, line, msg = "";
      var start = Math.max(0, lineno - n);
      var end = Math.min(lineno + n, lines.length);

      for (i = start; i < end; i++) {
        line = lines[i];
        if (line.length > 256) continue;
        msg += i === lineno ?  '  ⇢ ' : '    ';
        msg += line.slice(0, 120) + '\n';
      }
      return msg;
    }

    var line, call, msg;
    for (var i = 1, L = stack.length; i < L; i++) {
      call = stack[i];
      var lineno = call.getLineNumber() - module.exports.SOURCE_LINE_OFFSET;
      line = lines[lineno];
      if (i === 1 && line.length < 256) {
        msg = line.match(/assert\((.*)\)/)[1];
      }
      if (lineno > 0) {
        var fnName = call.getFunctionName();
        msg += '\n';
        msg += '  at ' + call.getFunctionName();
        msg += ' (' + call.getFileName() + ':' + call.getLineNumber() + ':' + call.getColumnNumber() + ')';

        var codeContext = getCodeContext(lineno, 2);
        if (codeContext) {
          msg += '\n';
          msg += codeContext;
        }
      }
    }
  } else {
    msg = 'Could not load code from plv8_sources table';
  }

  var err = new AssertionError({
    message: msg,
    stackStartFunction: stack[0].fun
  });

  throw err;
}
