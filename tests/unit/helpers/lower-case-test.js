import {
  lowerCase
} from 'ui/helpers/lower-case';

module('LowerCaseHelper');

// Replace this with your real tests.
test('it works with strings', function() {
  var result = lowerCase("HELLO");
  ok(result === "hello");
});
