import Ember from 'ember';
import { byId } from 'ui/models/service';

export default Ember.Route.extend({
  model: function(params) {
    var env = this.modelFor('environment');
    var service = byId(params.service_id);
    if ( service )
    {
      return Ember.Object.create({
        service: service,
        stack: env.get('stack'),
      });
    }
    else
    {
      return this.get('store').find('service', params.service_id).then((service) => {
        return Ember.Object.create({
          service: service,
          stack: env.get('stack'),
        });
      });
    }
  },
});
