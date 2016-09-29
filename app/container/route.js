import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    debugger;
    var store = this.get('store');
    var ports;

    return Ember.RSVP.hash({
      hosts: store.findAll('host'),
      container: store.find('container', params.container_id),
    }).then((hash) => {
      return hash.container.followLink('ports').then(function(p) {
        ports = p;
        return hash.container;
      });
    }).then(function(container) {
      debugger;
      var host = container.get('primaryHost');
      if ( !host || !host.get || !host.hasLink('instances') )
      {
        return container;
      }
      else
      {
        return host.importLink('instances').then(() => {
          return container;
        });
      }
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
      mountError: data.get('mountError'),
      relatedVolumes: data.get('relatedVolumes'),
      ports: data.get('ports'),
    });
  },
});
