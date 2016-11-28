import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    let container = this.modelFor('container');
    return container.followLink('ports').then((ports) => {
      return {
        container: container,
        ports: ports,
      };
    });
  }
});
