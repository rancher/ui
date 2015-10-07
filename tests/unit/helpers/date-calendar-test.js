import {
  moduleFor,
  test
} from 'ember-qunit';

import {
  dateCalendar
} from 'ui/helpers/date-calendar';

moduleFor('helper:date-calendar');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = dateCalendar([42]);
  assert.ok(result);
});
