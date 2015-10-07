import {
  moduleFor,
  test
} from 'ember-qunit';

import {
  dateStr
} from 'ui/helpers/date-str';

moduleFor('helper:date-str');

// Replace this with your real tests.
test('it works', function(assert) {
  var d = new Date('1982-02-24T18:42:00Z');
  var result = dateStr([d]);
  assert.ok(result);
});

test('it takes format strings', function(assert) {
  var d = new Date('1982-02-24T18:42:00Z');
  var result = dateStr([d],{format: 'MMMM'});
  assert.equal(result, 'February');
});
