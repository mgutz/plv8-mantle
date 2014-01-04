var assert = require('assert');
var spec = require('../microspec');

var ran = 0;
spec('microspec', {

  before: function() {
    ran++;
  },

  'should pass': function() {
    assert.ok(true);
    ran++;
  },

  '_should be pending': function() {
    // should not run
    ran++;
  },

  '#should be ignored': function() {
    // should not run
    ran++;
  },

  after: function() {
    assert.ok(ran === 3);
  },

  'should have run': function() {
    ran++;
  }
});

spec('microspec - subset marked with "+"', {
  before: function() {
    ran = 1;
  },

  '+should pass': function() {
    assert.ok(true);
    ran++;
  },

  '_should be pending': function() {
    // should not run
    ran++;
  },

  '#should be ignored': function() {
    // should not run
    ran++;
  },

  after: function() {
    console.log('RAN', ran);
    assert.ok(ran === 2);
  },

  'should not run because + is used above': function() {
    ran++;
  }
});


spec('microspec - leak', {
  'should catch global var leak': function() {
    badvar = 100;
  },

});


spec('microspec - intentional error', {
  before: function() {
    // delete bad var from above for other tests
    var global = (function() { return this; })(null);
    delete global.badvar;
  },

  'should fail': function() {
    assert.ok(false);
  }
});

spec('_microspec - entire spec is pending', {
  'should fail': function() {
    assert.ok(false);
  }
});

spec('#microspec - entire spec is ignored', {
  'should fail': function() {
    assert.ok(false);
  }
});

spec('should do async too', {
  before: function(done) {
    ran = 100;
    setTimeout(50, function() {
      ran = 0;
      done();
    });
  },

  'should run after before': function() {
    assert.ok(true);
    ran++;
  },

  after: function() {
    assert.ok(ran === 2);
  },

  'should run after before': function(done) {
    setTimeout(10, function() {
      ran++;
      done();
    });
  }
});

spec.run();
