/**
 * Module dependencies.
 */
var options = require('./options');

/**
 * Expose `assert`.
 */

var codeLines;

function parseStack(stack) {
  var i, line, lines = stack.split('\n');
  var rex = /([^\(]+)\(([^:]+):(\d+):(\d+)/;
  var matches;

  line = lines[0];
  var result = [line];
  for (i = 1; i < lines.length; i++) {
    line = lines[i];
    matches = line.match(rex);
    if (matches) {
      result.push({
        location: matches[1].trim(),
        filename: matches[2],
        lineno: parseInt(matches[3], 10),
        colno: parseInt(matches[4], 10)
      })
    }
  }

  return result;
}


function get__filename(lineno, defaultValue) {
  var codeLines = loadCodeLines();
  var line, matches;
  var filenameRegex = /__filename="\/([^"]+)/;
  while (lineno >= 0) {
    line = codeLines[lineno];
    matches = line.match(filenameRegex);
    if (matches) return matches[1];
    lineno--;
  }

  return defaultValue;
}


function getCodeContext(lineno, n) {
  var codeLines = loadCodeLines();
  var i, line, msg = "";
  var start = Math.max(0, lineno - n);
  //var end = Math.min(lineno + n, codeLines.length);
  var end = Math.min(lineno+1, codeLines.length);

  for (i = start; i < end; i++) {
    line = codeLines[i];
    if (line.length > 256) continue;

    msg += i === lineno ?  '  ⇢   ' : '      ';
    msg += line.slice(0, 74) + '\n';
  }
  return msg;
}

function loadCodeLines() {
  if (!codeLines) {
    var code = plv8.__executeScalar("select code from plv8_sources where filename = 'plv8_startup'");
    codeLines = code.split('\n');
  }
  return codeLines;
}

/**
 * Creates a pretty stack trace.
 */
exports.stackTrace = function stackTrace(istack) {
  var stack = parseStack(istack);
  console.dir(stack);
  var codeLines = loadCodeLines();
  if (codeLines) {
    var addLine, filename, line, call, msg = '';
    for (var i = 0, L = stack.length; i < L; i++) {
      call = stack[i];
      msg += '\n';

      if (call.filename === '<anonymous>') {
        // ignore
      } else if (call.location) {
        var lineno = call.lineno - options.sourceLineOffset;
        if (lineno < 1) continue;

        line = codeLines[lineno];
        filename = get__filename(lineno, call.filename);

        msg += '  ' + call.location + ' (' + filename + ':' + call.lineno + ':' + call.colno + ')';
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
  //console.log('msg', msg);
  return { stack: stack, message: msg };
}


function dumpSource(lineno, contextLines) {
  if (!contextLines || contextLines < 1) contextLines = options.contextLines;

  lineno = lineno - options.sourceLineOffset;
  if (lineno < 1) return console.error('Argument lineno too small');
  var code = getCodeContext(lineno, contextLines);
  var filename = get__filename(lineno, "<__filename not found>");
  var message = '\nFilename: ' + filename + '\n' + code;
  console.log(message);
}
exports.dumpSource = dumpSource;

plv8.__dumpSource = dumpSource;


