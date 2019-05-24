import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  model(params) {
    const store = get(this, 'store');

    return hash({
      deployments: store.findAll('deployment'),
      hpa:         store.find('horizontalpodautoscaler', params.hpa_id),
    });
  },
});
