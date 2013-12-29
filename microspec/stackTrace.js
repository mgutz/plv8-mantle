/**
 * Module dependencies.
 */
var options = require('./options');
var callsite = require('callsite');

/**
 * Expose `assert`.
 */

var code;

function parseStack(stack) {
  var i, line, lines = stack.split('\n');
  var result = [lines[0]];
  var rex = /([^\(]+)\(([^:]+):(\d+):(\d+)/;
  var matches;

  for (i = 1; i < lines.length; i++) {
    line = lines[i];
    matches = line.match(rex);
    if (matches) {
      result.push({
        location: matches[1].trim(),
        filename: matches[2],
        lineno: matches[3],
        colno: matches[4]
      })
    }
  }

  return result;
}

/**
 * Creates a pretty stack trace.
 */
function stackTrace(istack) {
  if (!code) {
    code = plv8.__executeScalar("select code from plv8_sources where filename = 'plv8_startup'");
  }

  var stack = parseStack(istack);
  if (code) {
    var lines = code.split('\n');
    function getCodeContext(lineno, n) {
      var i, line, msg = "";
      var start = Math.max(0, lineno - n);
      var end = Math.min(lineno + n, lines.length);

      for (i = start; i < end; i++) {
        line = lines[i];
        if (line.length > 256) continue;

        msg += i === lineno ?  '  ⇢   ' : '      ';
        msg += line.slice(0, 74) + '\n';
      }
      return msg;
    }

    var addLine, line, call, msg = '';
    for (var i = 0, L = stack.length; i < L; i++) {
      call = stack[i];
      msg += '\n';

      if (call.filename === '<anonymous>') {
        // ignore
      } else if (call.location) {
        var lineno = call.lineno - options.sourceLineOffset;
        if (lineno < 1) continue;
        line = lines[lineno];

        msg += '  ' + call.location + ' (' + call.filename + ':' + call.lineno + ':' + call.colno + ')';

        var codeContext = getCodeContext(lineno, options.contextLines);
        if (codeContext) {
          msg += '\n';
          msg += codeContext;
        }
      } else {
        msg += call;
      }
    }
  } else {
    msg = 'Could not load code from plv8_sources table';
  }

  return { stack: stack, message: msg };
}

module.exports = stackTrace;
