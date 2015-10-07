import {
  moduleFor,
  test
} from 'ember-qunit';

import {
  upperCase
} from 'ui/helpers/upper-case';

moduleFor('helper:upper-case');

// Replace this with your real tests.
test('it works with strings', function(assert) {
  var result = upperCase(["hello"]);
  assert.ok(result === "HELLO");
});
