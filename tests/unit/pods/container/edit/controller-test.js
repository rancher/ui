import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:container/edit', 'ContainerEditController', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
  needs: ['controller:networks', 'controller:hosts']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
