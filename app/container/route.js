import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');
    var ports;

    return Ember.RSVP.hash({
      container: store.find('container', params.container_id),
    }).then((hash) => {
      return hash.container.followLink('ports').then(function(p) {
        ports = p;
        return hash.container;
      });
    }).then(function(container) {
      return Ember.Object.create({
        container: container,
        ports: ports,
      });
    });
  },

  setupController: function(controller, data) {
    this._super(controller, data.get('container'));
    controller.setProperties({
      relatedVolumes: data.get('relatedVolumes'),
      ports: data.get('ports'),
    });
  },
});
