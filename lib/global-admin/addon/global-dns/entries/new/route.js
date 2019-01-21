import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  scope:       service(),

  model(params) {
    let globaldns = null;

    if (get(params, 'id')) {
      globaldns = this.globalStore.find('globaldns', params.id);
    } else {
      globaldns = this.globalStore.createRecord({
        type:       'globaldns',
        name:       '',
        projectIds: [],
      });
    }

    const providers        = this.globalStore.findAll('globaldnsprovider');
    const multiClusterApps = this.globalStore.findAll('multiclusterapp');
    const allProjects      = this.scope.getAllProjects();
    const allClusters      = this.scope.getAllClusters()

    return hash({
      globaldns,
      providers,
      multiClusterApps,
      allProjects,
      allClusters,
    });
  },

  afterModel(model/* , transition */) {
    let { providers } = model;

    if (providers && providers.length === 1) {
      set(model, 'globaldns.providerId', get(providers, 'firstObject.id'));
    }

    return;
  },

  setupController(controller, model) {
    if (model.globaldns && model.globaldns.id !== '') {
      controller.set('editing', true);
    }
    // Call _super for default behavior
    this._super(controller, model);
  },

  queryParams: { id: { refreshModel: true } },
});
