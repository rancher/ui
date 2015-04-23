import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:container', 'ContainerController', {
  needs: ['controller:hosts', 'controller:application','controller:authenticated']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
