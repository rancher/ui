import Ember from 'ember';
import { parseTarget, stringifyTarget } from 'ui/utils/parse-target';
import { module, test } from 'qunit';

module('Unit | Utils | parse-target');

var data = [
  // New Format
  {str: "example.com:80/path=81",     parsed: {hostname: 'example.com', srcPort: 80,    path: '/path',  dstPort: 81}},
  {str: "example.com:80=81",          parsed: {hostname: 'example.com', srcPort: 80,    path: null,     dstPort: 81}},
  {str: "example.com/path=81",        parsed: {hostname: 'example.com', srcPort: null,  path: '/path',  dstPort: 81}},
  {str: "example.com=81",             parsed: {hostname: 'example.com', srcPort: null,  path: null,     dstPort: 81}},
  {str: "80/path=81",                 parsed: {hostname: null,          srcPort: 80,    path: '/path',  dstPort: 81}},
  {str: "80=81",                      parsed: {hostname: null,          srcPort: 80,    path: null,     dstPort: 81}},
  {str: "/path=81",                   parsed: {hostname: null,          srcPort: null,  path: '/path',  dstPort: 81}},
  {str: "81",                         parsed: {hostname: null,          srcPort: null,  path: null,     dstPort: 81}},
  {str: "example.com:80/path",        parsed: {hostname: 'example.com', srcPort: 80,    path: '/path',  dstPort: null}},
  {str: "example.com:80",             parsed: {hostname: 'example.com', srcPort: 80,    path: null,     dstPort: null}},
  {str: "example.com/path",           parsed: {hostname: 'example.com', srcPort: null,  path: '/path',  dstPort: null}},
  {str: "example.com",                parsed: {hostname: 'example.com', srcPort: null,  path: null,     dstPort: null}},
  {str: "80/path",                    parsed: {hostname: null,          srcPort: 80,    path: '/path',  dstPort: null}},
//  {str: "80", Invalid, == dstPort   parsed: {hostname: null,          srcPort: 80,    path: null,     dstPort: null}},
  {str: "/path",                      parsed: {hostname: null,          srcPort: null,  path: '/path',  dstPort: null}},
//  {"", Invalid, but symmetry...     parsed: {hostname: null,          srcPort: null,  path: null,     dstPort: null}},
//
  // Special case, numeric hostname
  {str: "1:2/3=4",                    parsed: {hostname: '1',           srcPort: 2,     path: '/3',     dstPort: 4}},
  {str: "host3:7777",                 parsed: {hostname: 'host3',       srcPort: 7777,  path: null,     dstPort: null}},
  {str: "3host:7777",                 parsed: {hostname: '3host',       srcPort: 7777,  path: null,     dstPort: null}},

  // Old format
  {str: "81:example.com/path",         parsed: {hostname: 'example.com', srcPort: null,  path: '/path',  dstPort: 81}, expected: "example.com/path=81"},
  {str: "81:example.com",              parsed: {hostname: 'example.com', srcPort: null,  path: null,     dstPort: 81}, expected: "example.com=81"},
  {str: "81:example.com:82",           parsed: {hostname: 'example.com', srcPort: 82,    path: null,     dstPort: 81}, expected: "example.com:82=81"},
  {str: "81:example.com:82/path",      parsed: {hostname: 'example.com', srcPort: 82,    path: '/path',  dstPort: 81}, expected: "example.com:82/path=81"},
  {str: "81:/path",                    parsed: {hostname: null,          srcPort: null,  path: '/path',  dstPort: 81}, expected: "/path=81"},

  // Invalid
//  {str: ":81",                         parsed: null},
//  {str: "example.com::81",             parsed: null},
];

data.forEach(function(obj) {
  var input = obj.str;
  var actual = parseTarget(input);

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
      var actual = stringifyTarget(input);
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
