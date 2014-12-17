import {
  dateStr
} from 'ui/helpers/date-str';

module('DateStrHelper');

// Replace this with your real tests.
test('it works', function(assert) {
  var d = new Date('1982-02-24T18:42:00Z');
  var result = dateStr(d);
  assert.ok(result);
});

test('it takes format strings', function(assert) {
  var d = new Date('1982-02-24T18:42:00Z');
  var result = dateStr(d,{hash: {format: 'MMMM'}});
  assert.equal(result, 'February');
});
