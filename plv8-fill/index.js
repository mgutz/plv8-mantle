/**
 * plv8Fill - Adds extra methods to plv8. All methods are prefixed with '__'
 * to reduce possibility of conflict.
 */

/**
 * Trace SQL queries if client_min_messages starts with 'debug'.
 */
var DEBUG;
(function() {
  var rows = plv8.execute("select setting from pg_settings where name='client_min_messages'");
  DEBUG = rows[0].setting.indexOf('debug') === 0;
})();



/**
 * Wraps logging around plv8.execute.
 *
 * client_min_messages must be {debug1, ..., debug5}
 */
function __execute(sql, args) {
  if (DEBUG) {
    console.log('plv8.__execute\n', sql , args ? args : '');
  }

  return plv8.execute.apply(plv8, arguments);
};

plv8.__execute = __execute;
plv8.__executeRows = __execute;


/**
 * Executes `sql` with an `args` array, returning a scalar value.
 */
plv8.__executeScalar = function(sql, args) {
  //var result = plv8.execute.apply(plv8, arguments);
  var result = __execute.apply(null, arguments);
  var L = result.length;
  if (L === 1)  {
    var row = result[0];
    for (var scalarKey in row) break;
    return row[scalarKey];
  } else if (L === 0) {
    return null;
  } else {
    throw new Error('Expected single row, query returned multiple rows');
  }
};


/**
 * Executes `sql` with an `args` array, returning a single row.
 */
plv8.__executeRow = function(sql, args) {
  var result = __execute.apply(null, arguments);
  var L = result.length;
  if (L === 1)  {
    return result[0];
  } else if (L === 0) {
    return null;
  } else {
    throw new Error('Expected single row, query returned multiple rows');
  }
}


/**
 * Executes a command which returns the affected records like an update.
 */
plv8.__executeCommand = function(sql, args) {
  var result = __execute.apply(null, arguments);
  if (typeof result === 'number') {
    return result;
  } else {
    throw new Error('Expected single number value of records affected');
  }
}


/**
 * Dumps plv8's global context.
 */
plv8.__dumpGlobal = function() {
  var globals = [];
  var k, global = (function(){return this;})(null);
  for (k in global) {
    globals.push(k);
  }
  var summary = ['\n', 'Globals', '-------'].concat(globals.sort()).join('\n');
  plv8.elog(LOG, summary);
}


// !!!
// `plv8.__dumpSource` is added by microspec/stackTrace and should only
// be used while unit testing

