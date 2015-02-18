import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:network', 'NetworkController', {
  needs: ['controller:application']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
