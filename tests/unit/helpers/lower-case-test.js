import {
  moduleFor,
  test
} from 'ember-qunit';

import {
  lowerCase
} from 'ui/helpers/lower-case';

moduleFor('helper:lower-case');

// Replace this with your real tests.
test('it works with strings', function(assert) {
  var result = lowerCase(["HELLO"]);
  assert.ok(result === "hello");
});
