import {
  upperCase
} from 'ui/helpers/upper-case';

module('UpperCaseHelper');

// Replace this with your real tests.
test('it works with strings', function() {
  var result = upperCase("hello");
  ok(result === "HELLO");
});
