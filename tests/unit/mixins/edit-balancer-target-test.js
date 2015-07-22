import Ember from 'ember';
import EditBalancerTargetMixin from 'ui/mixins/edit-balancer-target';
import { parseTarget, stringifyTarget } from 'ui/mixins/edit-balancer-target';
import { module, test } from 'qunit';

module('Unit | Mixin | edit balancer target');

// Replace this with your real tests.
test('it works', function(assert) {
  var EditBalancerTargetObject = Ember.Object.extend(EditBalancerTargetMixin);
  var subject = EditBalancerTargetObject.create();
  assert.ok(subject);
});

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

  // Old format
  {str: "81:example.com/path",         parsed: {hostname: 'example.com', srcPort: null,  path: '/path',  dstPort: 81}, expected: "example.com/path=81"},
  {str: "81:example.com",              parsed: {hostname: 'example.com', srcPort: null,  path: null,     dstPort: 81}, expected: "example.com=81"},
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
      assert.strictEqual(Ember.get(actual,'hostname'),  Ember.get(expected, 'hostname'), 'Hostname parses correctly');
      assert.strictEqual(Ember.get(actual,'srcPort'),   Ember.get(expected, 'srcPort'),  'SrcPort parses correctly');
      assert.strictEqual(Ember.get(actual,'path'),      Ember.get(expected, 'path'),     'Path parses correctly');
      assert.strictEqual(Ember.get(actual,'dstPort'),   Ember.get(expected, 'dstPort'),  'DstPort parses correctly');
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
