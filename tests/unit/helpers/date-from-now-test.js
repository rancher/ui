import {
  moduleFor,
  test
} from 'ember-qunit';

import {
  dateFromNow
} from 'ui/helpers/date-from-now';

moduleFor('helper:date-from-now');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = dateFromNow([42]);
  assert.ok(result);
});
