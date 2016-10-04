import Ember from 'ember';
import NewBalancerMixin from 'ui/mixins/new-balancer';
import { module, test } from 'qunit';

module('Unit | Mixin | new balancer');

// Replace this with your real tests.
test('it works', function(assert) {
  let NewBalancerObject = Ember.Object.extend(NewBalancerMixin);
  let subject = NewBalancerObject.create();
  assert.ok(subject);
});
