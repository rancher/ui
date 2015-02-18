import {
  moduleFor,
  test
} from 'ember-qunit';

import {
  ucFirst
} from 'ui/helpers/uc-first';

moduleFor('helper:uc-first');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = ucFirst("things and stuff");
  assert.ok(result === "Things and stuff");
});
