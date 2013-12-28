var assert = require('./assert');
var spec = require('../microspec');

var ran = 0;
spec('microspec', {

  before: function() {
    ran++;
  },

  'should pass': function() {
    assert(true);
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
    assert(ran === 3);
  },

  'should have run': function() {
    ran++;
  }
});

ran = 0;
spec('microspec - subset marked with "+"', {
  before: function() {
    ran++;
  },

  '+should pass': function() {
    assert(true);
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
    assert(ran === 2);
  },

  'should have run': function() {
    ran++;
  }
});


spec('microspec - intentional errors', {
  'should catch global var leak': function() {
    spec('global var leak',  function() {
      badvar = 100;
    });
    // delete bad var from above for other tests
    var global = (function() { return this; })(null);
    delete global.badvar;
  },

  'should fail': function() {
    assert("hello" === "yello");
  },
});

spec('_microspec - entire spec is pending', {
  'should fail': function() {
    assert(false);
  }
});

spec('#microspec - entire spec is ignored', {
  'should fail': function() {
    assert(false);
  }
});
