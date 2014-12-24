import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:container', 'ContainerController', {
  needs: ['controller:hosts', 'controller:application']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
