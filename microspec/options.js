module.exports = {
  // known globals used to determin leaks
  globals: [
    'DEBUG5',
    'DEBUG4',
    'DEBUG3',
    'DEBUG2',
    'DEBUG1',
    'DEBUG',
    'LOG',
    'INFO',
    'NOTICE',
    'WARNING',
    'ERROR',
    'plv8'
  ],

  // whether to use ANSI escape color codes when logging
  colorful: false,

  // used to get actual source in stack traces
  sourceLineOffset: 0,

  // number of code lines before and after the current statement
  // in stack traces
  contextLines: 2
};

