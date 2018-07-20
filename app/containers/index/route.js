import { on } from '@ember/object/evented';
import { hash } from 'rsvp';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore: service(),

  model() {
    var store = this.get('store');
    var globalStore = this.get('globalStore');

    return hash({
      workloads: store.findAll('workload'),
      pods:      store.findAll('pod'),
      nodes:     globalStore.findAll('node'),
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CONTAINER_ROUTE }`, 'containers');
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, undefined);
  }),
});
