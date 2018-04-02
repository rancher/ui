import { get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function (params) {
    return get(this, 'store').find('pod', params.container_id);
  },
});
