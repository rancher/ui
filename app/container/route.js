import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {

    return this.get('store').find('container', params.container_id).then((container) => {

      return Ember.RSVP.hash({
        hosts:         this.get('store').findAll('host'),
      }).then((hash) => {

        let out = {
          container:     container,
          hosts:         hash.hosts,
        };

        if (container.serviceId) {
          out.service = this.get('store').getById('service', container.serviceId);
        }

        return out;
      });
    });
  },
});
