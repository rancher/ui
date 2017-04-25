import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('container', params.container_id).then((container) => {
      return Ember.RSVP.hash({
        ports: container.followLink('ports'),
        hosts: this.get('store').findAll('host')
      }).then((hash) => {
        return {
          container: container,
          ports: hash.ports,
          hosts: hash.hosts
        };
      });
    });
  },
});
