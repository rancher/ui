import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params) {

    return this.get('store').find('pod', params.container_id).then((container) => {
      let out = {
        container:     container,
      };
      if (container.serviceId) {
        out.service = this.get('store').getById('service', container.serviceId);
      }
      return out;
    });
  },
});
