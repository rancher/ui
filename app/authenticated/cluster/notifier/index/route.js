import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get } from '@ember/object'
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model(params, transition) {
    const cs = get(this, 'globalStore');
    const clusterId = transition.params['authenticated.cluster'].cluster_id;
    return hash({
      notifiers: cs.findAll('notifier', {filter: {clusterId}}).then(() => {
        return cs.all('notifier');
      }),
    });
  },
});
