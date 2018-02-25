import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  model: function(params) {
    return get(this,'store').find('dnsRecord', params.record_id);
  },
});
