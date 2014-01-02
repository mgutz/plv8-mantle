/**
 * Gets the global context.
 */
exports.getGlobal = function() {
  return (function() { return this; })(null);
};


exports.extend = function(object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};

// https://github.com/jgallen23/resistance/
exports.series = function series(fns, callback) {
  if (fns.length === 0) return callback();
  var completed = 0;
  var data = [];
  var iterate = function() {
    fns[completed](function(results) {
      data[completed] = results;
      if (++completed == fns.length) {
        // this is preferred for .apply but for size, we can use data
        if (callback) callback.apply(data, data);
      } else {
        iterate();
      }
    });
  };
  iterate();
};

exports.parallel = function parallel(fns, callback) {
  if (fns.length === 0) return callback();
  var started = 0;
  var completed = 0;
  var data = [];
  var iterate = function() {
    fns[started]((function(i) {
      return function(results) {
        data[i] = results;
        if (++completed == fns.length) {
          if (callback) callback.apply(data, data);
          return;
        }
      };
    })(started));
    if (++started != fns.length) iterate();
  };
  iterate();
};
