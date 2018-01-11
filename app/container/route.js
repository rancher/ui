import { get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function (params) {

    return get(this, 'store').find('pod', params.container_id).then((container) => {
      let out = {
        instance: get(container, 'containers.firstObject'),
        container: container,
      };
      if (container.serviceId) {
        out.service = get(this, 'store').getById('service', container.serviceId);
      }
      return out;
    });
  },
});
