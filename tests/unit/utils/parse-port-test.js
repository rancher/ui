import Ember from 'ember';
import { parsePort, stringifyPort } from 'ui/utils/parse-port';
import { module, test } from 'qunit';

module('Unit | Utils | parse-port');

var data = [
  {str: '80',                         parsed: {host: '',                  hostIp: null,             hostPort: null, container: 80, protocol: 'http'}},
  {str: '80/tcp',                     parsed: {host: '',                  hostIp: null,             hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '90:80',                      parsed: {host: '90',                hostIp: null,             hostPort: 90,   container: 80, protocol: 'http'}},
  {str: '90:80/http',                 parsed: {host: '90',                hostIp: null,             hostPort: 90,   container: 80, protocol: 'http'},   expected: '90:80'},
  {str: '1.2.3.4::80',                parsed: {host: '1.2.3.4:',          hostIp: '1.2.3.4',        hostPort: null, container: 80, protocol: 'http'}},
  {str: '1.2.3.4::80/tcp',            parsed: {host: '1.2.3.4:',          hostIp: '1.2.3.4',        hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '1.2.3.4:90:80',              parsed: {host: '1.2.3.4:90',        hostIp: '1.2.3.4',        hostPort: 90,   container: 80, protocol: 'http'}},
  {str: '1.2.3.4:90:80/tcp',          parsed: {host: '1.2.3.4:90',        hostIp: '1.2.3.4',        hostPort: 90,   container: 80, protocol: 'tcp'}},
  {str: '[12:34:56::78]::80',         parsed: {host: '[12:34:56::78]:',   hostIp: '[12:34:56::78]', hostPort: null, container: 80, protocol: 'http'}},
  {str: '[12:34:56::78]::80/tcp',     parsed: {host: '[12:34:56::78]:',   hostIp: '[12:34:56::78]', hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '[12:34:56::78]:90:80',       parsed: {host: '[12:34:56::78]:90', hostIp: '[12:34:56::78]', hostPort: 90,   container: 80, protocol: 'http'}},
  {str: '[12:34:56::78]:90:80/tcp',   parsed: {host: '[12:34:56::78]:90', hostIp: '[12:34:56::78]', hostPort: 90,   container: 80, protocol: 'tcp'}},
];

data.forEach(function(obj) {
  var input = obj.str;
  var actual = parsePort(input);

  if ( obj.parsed )
  {
    test('it can parse: ' + obj.str, function(assert) {
      var expected = obj.parsed;
      Object.keys(expected).forEach((key) => {
        assert.strictEqual(Ember.get(actual,key), Ember.get(expected, key), key + ' parses correctly');
      });
    });

    test('it can stringify: ' + obj.str, function(assert) {
      var input = obj.parsed;
      var expected = obj.expected || obj.str;
      var actual = stringifyPort(input);
      assert.strictEqual(actual, expected, 'Objects are stringified correctly');
    });
  }
  else
  {
    test("it can't parse: " + obj.str, function(assert) {
      assert.strictEqual(actual, null, 'Invalid data is not parseable');
    });
  }
});
