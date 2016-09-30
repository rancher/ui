import Ember from 'ember';
import { getByServiceId } from 'ui/utils/denormalize-snowflakes';

export default Ember.Route.extend({
  model: function(params) {
    var stack = this.modelFor('stack');
    var service = getByServiceId(this.get('store'), params.service_id);
    if ( service )
    {
      return Ember.Object.create({
        service: service,
        stack: stack.get('stack'),
      });
    }
    else
    {
      return this.get('store').find('service', params.service_id).then((service) => {
        return Ember.Object.create({
          service: service,
          stack: stack.get('stack'),
        });
      });
    }
  },
});
