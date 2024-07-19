import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  catalog: service(),
  store:   service(),

  beforeModel() {
    return this.catalog.fetchUnScopedCatalogs();
  },


  model() {
    return this.store.findAll('app')
      .then((apps) => ({ apps, }));
  },

  afterModel(model/* , transition */) {
    return this.catalog.fetchAppTemplates(get(model, 'apps'));
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'apps-tab');
  }),
});
