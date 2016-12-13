import { parse, minorVersion } from 'ui/utils/parse-version';
import { module, test } from 'qunit';

module('Unit | Utils | parse-version');

var data = [
  {str: 'v1',                       parsed: ['1'],                      minor: 'v1.0'},
  {str: 'v1.0',                     parsed: ['1','0'],                  minor: 'v1.0'},
  {str: 'v1.0.0',                   parsed: ['1','0','0'],              minor: 'v1.0'},
  {str: 'v1.1.0',                   parsed: ['1','1','0'],              minor: 'v1.1'},
  {str: 'v1.1.1',                   parsed: ['1','1','1'],              minor: 'v1.1'},
  {str: 'v1.0.0-foo',               parsed: ['1','0','0','foo'],        minor: 'v1.0'},
  {str: 'v1.1.0-foo',               parsed: ['1','1','0','foo'],        minor: 'v1.1'},
  {str: 'v1.0.0-pre1',              parsed: ['1','0','0','pre1'],       minor: 'v1.0'},
  {str: 'v1.0.1-pre1',              parsed: ['1','0','1','pre1'],       minor: 'v1.0'},
  {str: 'v1.1.0-pre1',              parsed: ['1','1','0','pre1'],       minor: 'v1.1'},
  {str: 'v1.2.0-pre1',              parsed: ['1','2','0','pre1'],       minor: 'v1.2'},
  {str: 'v1.2.1-pre1',              parsed: ['1','2','1','pre1'],       minor: 'v1.2'},
  {str: 'v1.2.0-pre2',              parsed: ['1','2','0','pre2'],       minor: 'v1.2'},
  {str: 'v1.2.0-pre2-rc1',          parsed: ['1','2','0','pre2','rc1'], minor: 'v1.2'},
  {str: 'v1.2.1-pre2-rc1',          parsed: ['1','2','1','pre2','rc1'], minor: 'v1.2'},
  {str: 'v1.2.1-pre2-rc2',          parsed: ['1','2','1','pre2','rc2'], minor: 'v1.2'},
];

data.forEach(function(obj) {
  var input = obj.str;
  var actual = parse(input);

  test('it can parse: ' + obj.str, function(assert) {
    var expected = obj.parsed;
    assert.strictEqual(actual.length, expected.length, 'Parsed is the right length');
    assert.strictEqual(actual.join('#'), expected.join('#'), 'Strings are parsed correctly');
  });

  test('it can minorVersion: ' + obj.str, function(assert) {
    var expected = obj.minor;
    var actual = minorVersion(input);
    assert.strictEqual(actual, expected, 'Minors are minored correctly');
  });
});
