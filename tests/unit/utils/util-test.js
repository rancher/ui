import {
  moduleFor,
  test
} from 'ember-qunit';

import util from 'ui/utils/util';

moduleFor('util:util');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = util.arrayDiff([1,2,3],[1,2]);
  assert.equal(result.length, 1);
  assert.equal(result[0], 3);
});
