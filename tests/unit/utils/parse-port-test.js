import Ember from 'ember';
import { parsePortSpec, stringifyPortSpec, parseIpPort } from 'ui/utils/parse-port';
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
  var actual = parsePortSpec(input);

  if ( obj.parsed )
  {
    test('it can parse spec: ' + obj.str, function(assert) {
      var expected = obj.parsed;
      Object.keys(expected).forEach((key) => {
        assert.strictEqual(Ember.get(actual,key), Ember.get(expected, key), key + ' parses correctly');
      });
    });

    test('it can stringify spec: ' + obj.str, function(assert) {
      var input = obj.parsed;
      var expected = obj.expected || obj.str;
      var actual = stringifyPortSpec(input);
      assert.strictEqual(actual, expected, 'Objects are stringified correctly');
    });
  }
  else
  {
    test("it can't parse spec: " + obj.str, function(assert) {
      assert.strictEqual(actual, null, 'Invalid data is not parseable');
    });
  }
});

data = [
  {str: '',                           parsed: null},
  {str: '80',                         parsed: {ip: null,              port: 80  }},
  {str: 'asdf',                       parsed: {ip: 'asdf',            port: null}},
  {str: '1.2.3.4',                    parsed: {ip: '1.2.3.4',         port: null}},
  {str: '1.2.3.4:80',                 parsed: {ip: '1.2.3.4',         port: 80  }},
  {str: '1.2.3.4:12ab',               parsed: {ip: '1.2.3.4',         port: null}},
  {str: 'asdf:12ab',                  parsed: {ip: 'asdf',            port: null}},
  {str: '80asdf',                     parsed: {ip: '80asdf',          port: null}},
  {str: '12:34:56::78',               parsed: {ip: '[12:34:56::78]',  port: null}},
  {str: '[12:34:56::78]',             parsed: {ip: '[12:34:56::78]',  port: null}},
  {str: '[12:34:56::78]:80',          parsed: {ip: '[12:34:56::78]',  port: 80  }},
  {str: '[12:34:56::78]:asdf',        parsed: {ip: '[12:34:56::78]',  port: null}},
  {str: '[12:34:56::78]:90:ab',       parsed: {ip: '[12:34:56::78]',  port: null}},
  {str: '2001:0db8:85a3:0000:0000:8a2e:0370:7334', parsed: {ip: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]',  port: null}},
  {str: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:80', parsed: {ip: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]',  port: 80}},
];

data.forEach(function(obj) {
  var input = obj.str;
  var actual = parseIpPort(input);

  test('it can parse: ' + obj.str, function(assert) {
    var expected = obj.parsed;

    if ( expected === null )
    {
      assert.strictEqual(actual, null,  input + ' cannot be parsed');
    }
    else
    {
      Object.keys(expected).forEach((key) => {
        assert.strictEqual(Ember.get(actual,key), Ember.get(expected, key), key + ' parses correctly');
      });
    }
  });
});
