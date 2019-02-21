import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { hash, all } from 'rsvp';

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
    let { members } = model.globaldns;

    if (get(providers, 'length') === 1 && !get(model, 'globaldns.providerId')) {
      this.initProviderId(model, providers);
    }

    if (members) {
      return this.fetchMembers(model);
    }


    return model;
  },

  setupController(controller, model) {
    if (get(model, 'globaldns.id')) {
      controller.set('mode', 'edit');
    } else {
      controller.set('mode', 'new');
    }

    if (get(model, 'globaldns.projectIds.length') > 0) {
      controller.set('recordType', 'project');
    }
    // Call _super for default behavior
    this._super(controller, model);
  },

  initProviderId(model, providers) {
    set(model, 'globaldns.providerId', get(providers, 'firstObject.id'));
  },

  fetchMembers(model) {
    let { members } = model.globaldns;

    if (members) {
      const membersPromises = [];

      members.forEach((member) => {
        if (get(member, 'userPrincipalId')) {
          membersPromises.push(this.globalStore.find('principal', member.userPrincipalId));
        } else if (get(member, 'groupPrincipalId')) {
          membersPromises.push(this.globalStore.find('principal', member.groupPrincipalId));
        }
      });

      return all(membersPromises);
    }
  },

  queryParams: { id: { refreshModel: true } },
});
