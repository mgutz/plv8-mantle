/**
 * plv8Fill - Adds extra methods to plv8. All methods are prefixed with '__'
 * to reduce possibility of conflict.
 */


/**
 * Executes `sql` with an `args` array, returning a scalar value.
 */
plv8.__executeScalar = function(sql, args) {
  var result = plv8.execute.apply(plv8, arguments);
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
  var result = plv8.execute.apply(plv8, arguments);
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

