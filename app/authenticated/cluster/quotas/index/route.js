import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore:  service(),

  shortcuts:       { 'q': 'toggleGrouping', },

  model() {
    return get(this, 'globalStore').findAll('resourceQuotaTemplate');
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.quotas');
  }),

});
