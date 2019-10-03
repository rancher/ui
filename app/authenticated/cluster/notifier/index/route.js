import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get, set } from '@ember/object'
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore: service(),
  scope:        service(),

  model(/* params, transition */) {
    const cs = get(this, 'globalStore');
    const clusterId = get(this.scope, 'currentCluster.id');

    return hash({ notifiers: cs.find('notifier', null, { filter: { clusterId } }).then(() => cs.all('notifier')) });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.notifier');
  }),
});
