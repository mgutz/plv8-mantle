/**
 * plv8Fill - Adds extra methods to plv8. All methods are prefixed with '__'
 * to reduce possibility of conflict.
 */

/**
 * Executes SQL with optional params, returning a scalar value.
 */
plv8.__executeScalar = function() {
  var result = plv8.execute.apply(plv8, arguments);
  var L = result.length;
  if (L === 0)  {
    return null;
  } else if (L === 1) {
    var row = result[0];
    var scalarKey = Object.keys(row)[0];
    return row[scalarKey];
  } else {
    throw new Error('Expected single row, query returned multiple rows');
  }
};


plv8.__executeRow = function() {
  var result = plv8.execute.apply(plv8, arguments);
  var L = result.length;
  if (L === 0)  {
    return null;
  } else if (L === 1) {
    return result[0];
  } else {
    throw new Error('Expected single row, query returned multiple rows');
  }
}


plv8.__dumpGlobal = function() {
  var global = (function(){returnthis;})
  var globals = [];
  for (var k in global) {
    globals.push(k);
  }
  var summary = ['\n', 'Globals', '-------'].concat(globals.sort()).join('\n');

  // if (global.require) {
  //   var packages =  [];
  //   for (var k in global.require) {
  //     packages.push(k);
  //   }
  //   summary = summary.concat(['\n', 'Requirable Packages', '-------------------'].concat(packages.sort()).join('\n'));
  // }
  plv8.elog(LOG, summary);
}

