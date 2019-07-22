import { get, set, setProperties } from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore:  service(),
  clusterStore: service(),
  scope:        service(),

  model(params) {
    const clusterStore = get(this, 'clusterStore');

    const namespace = clusterStore.createRecord({
      type:      'namespace',
      name:      '',
      clusterId: get(this, 'scope.currentCluster.id'),
    });

    if (params.addTo) {
      set(namespace, 'projectId', get(params, 'addTo'));
      const containerDefaultResourceLimit = get(namespace, 'project.containerDefaultResourceLimit');

      if ( containerDefaultResourceLimit ) {
        set(namespace, 'containerDefaultResourceLimit', containerDefaultResourceLimit);
      }
    }

    return hash({
      namespace,
      namespaces:        get(this, 'clusterStore').findAll('namespace'),
      allProjects:       get(this, 'globalStore').findAll('project'),
    });
  },

  resetController(controller, isExiting/* , transition*/) {
    if ( isExiting ) {
      setProperties(controller, {
        errors:         null,
        istioInjection: false
      });
    }
  },
  queryParams: {
    addTo: { refreshModel: true },
    from:  { refreshModel: false }
  },

});
