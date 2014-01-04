/**
 * Module dependencies.
 */
var options = require('./options');
var isPlv8 = typeof plv8 !== 'undefined';

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


function getCodeContext(filename, lineno, colno, n) {
  var codeLines = loadCodeLines(filename);
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

function loadCodeLines(filename) {
  if (isPlv8) {
    if (!codeLines) {
      var code = plv8.__executeScalar("select code from plv8_sources where filename = 'plv8_startup'");
      codeLines = code.split('\n');
    }
    return codeLines;
  }
  return null;
}

/**
 * Creates a pretty stack trace.
 */
exports.stackTrace = function stackTrace(istack) {
  var stack = parseStack(istack);
  console.dir(stack);
  var addLine, filename, call, msg = '';
  for (var i = 0, L = stack.length; i < L; i++) {
    call = stack[i];
    msg += '\n';

    if (call.filename === '<anonymous>') {
      // ignore
    } else if (call.location) {
      var lineno = (isPlv8) ? call.lineno  - options.sourceLineOffset : call.lineno;
      if (lineno < 1) continue;

      //line = codeLines[lineno];
      filename = get__filename(lineno, call.filename);

      msg += '  ' + call.location + ' (' + filename + ':' + call.lineno + ':' + call.colno + ')';
      var codeContext = getCodeContext(filename, lineno, call.colno, options.contextLines);
      if (codeContext) {
        msg += '\n';
        msg += codeContext;
      }
    } else {
      msg += call;
    }
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

if (isPlv8) {
  plv8.__dumpSource = dumpSource;
}


