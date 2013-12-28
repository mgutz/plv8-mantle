# plv8-microspec

Simple, synchronous unit testing.


## Options

microspec has a few options

    var spec = require('plv8-microspec');

To output colorful red/green (pass/fail) messages

    spec.colorful(true);

Global leaks are checked automatically. To add exclusions

    spec.addGlobals(['YourApp', 'console']);

## Assert

While you may use any assert library, they will not give you much context
when an error occurs due to the bundling of code. It is advised to
use the provided `microspec.assert` which gives a nice error stack, where `⇢ `
marks the execution path.

    AssertionError: 3 > 5
      at spec.should fail (plv8_startup:2660:5)
        spec('better assert', {
          'should fail': function() {
      ⇢     assert(3 > 5);
          }

      at module.exports (plv8_startup:1516:9)
              } else {
                summary.push('  - ' + name);
      ⇢         testCase();
                ran += 1;

`microspec.assert` has a simple signature `function(truthy)`.

    assert(false);          // same as assert.fail()
    assert(true);           // as as assert.ok()
    assert(1 == 1);         // same as assert.equal()
    assert(1 === 1);        // same as assert.strictEqual()

## Example

A spec is a simple function `spec(name, testsObject)`.
Each spec requires a `name`, which is the subject matter. Test functions are properties
of `testObject`.

The first character of a spec name may be special

*   `_` Pending spec, will not run.
*   `#` Ignore spec.

The first character of a test name may be special character

*   `+` Run ONLY marked tests. A quick way to isolate 1 or more tests.
*   `_` Pending test, will not run.
*   `#` Ignore test.

Any other test is a normal test.

Example

    //// test/example.js

    var assert = require('assert');         // bring your own assert
    var spec = require('plv8-microspec');

    spec('Test Header', {
      '+should run only this test': function() {
      },

      '_should be pending': function(){
      },

      '#should be ignored': function() {
      },

      'should run absence of special character': function() {
        assert.equal(1, 1);
      }
    });

Requiring a spec runs it immediately. For example, to run multiple specs

    require('/test/example');
    require('/test/example2');

