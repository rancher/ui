import Ember from 'ember';
import { parsePortSpec } from 'ui/utils/parse-port';
import { module, test } from 'qunit';

module('Unit | Utils | parse-port');

var data = [
  {str: '80',                         parsed: {host: '',                  hostIp: null,             hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '80/tcp',                     parsed: {host: '',                  hostIp: null,             hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '90:80',                      parsed: {host: '90',                hostIp: null,             hostPort: 90,   container: 80, protocol: 'tcp'}},
  {str: '90:80/http',                 parsed: {host: '90',                hostIp: null,             hostPort: 90,   container: 80, protocol: 'http'},   expected: '90:80'},
  {str: '1.2.3.4::80',                parsed: {host: '1.2.3.4:',          hostIp: '1.2.3.4',        hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '1.2.3.4::80/tcp',            parsed: {host: '1.2.3.4:',          hostIp: '1.2.3.4',        hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '1.2.3.4:90:80',              parsed: {host: '1.2.3.4:90',        hostIp: '1.2.3.4',        hostPort: 90,   container: 80, protocol: 'tcp'}},
  {str: '1.2.3.4:90:80/udp',          parsed: {host: '1.2.3.4:90',        hostIp: '1.2.3.4',        hostPort: 90,   container: 80, protocol: 'udp'}},
  {str: '[12:34:56::78]::80',         parsed: {host: '[12:34:56::78]:',   hostIp: '[12:34:56::78]', hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '[12:34:56::78]::80/tcp',     parsed: {host: '[12:34:56::78]:',   hostIp: '[12:34:56::78]', hostPort: null, container: 80, protocol: 'tcp'}},
  {str: '[12:34:56::78]:90:80',       parsed: {host: '[12:34:56::78]:90', hostIp: '[12:34:56::78]', hostPort: 90,   container: 80, protocol: 'tcp'}},
  {str: '[12:34:56::78]:90:80/udp',   parsed: {host: '[12:34:56::78]:90', hostIp: '[12:34:56::78]', hostPort: 90,   container: 80, protocol: 'udp'}},
];

data.forEach(function(obj) {
  var input = obj.str;
  var actual = parsePortSpec(input);

  if ( obj.parsed )
  {
    test('it can parse spec: ' + obj.str, function(assert) {
      var expected = obj.parsed;
      Object.keys(expected).forEach((key) => {
        assert.strictEqual(Ember.get(actual,key), Ember.get(expected, key), key + ' parses correctly');
      });
    });
  }
  else
  {
    test("it can't parse spec: " + obj.str, function(assert) {
      assert.strictEqual(actual, null, 'Invalid data is not parseable');
    });
  }
});
