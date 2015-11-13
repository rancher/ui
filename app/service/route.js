import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var env = this.modelFor('environment');
    return this.get('store').find('service', params.service_id).then((service) => {
      return Ember.Object.create({
        service: service,
        stack: env.get('stack'),
      });
    });
  },
});
