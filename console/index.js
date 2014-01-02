var MAX_MSG_SIZE = 1000; // gibberish at 2009

process.stdout = {
  /**
   * Large messages confuses logging. A messsage of 2078 was displaying random
   * characters.
   */
  write: function(s) {
    if (!s) return;

    var start = 0, L = s.length;
    while (start < L) {
      plv8.elog(LOG, s.slice(start, start + Math.min(L - start, MAX_MSG_SIZE)));
      start += MAX_MSG_SIZE;
    }
  }
};

process.stderr = {
  write: function(s) {
    var start = 0, L = s.length;
    while (start < L) {
      plv8.elog(WARNING, s.slice(start, start + Math.min(L - start, MAX_MSG_SIZE)));
      start += MAX_MSG_SIZE;
    }
  }
};

module.exports = require('./console');

