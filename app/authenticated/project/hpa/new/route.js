import { hash } from 'rsvp';
import { set, get } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  clusterStore:  service(),

  model(params) {
    const store = get(this, 'store');
    const clusterStore = get(this, 'clusterStore');

    const deps = {
      deployments: store.findAll('workload').then((workloads) => workloads.filter((w) => w.type === 'statefulSet' || w.type === 'deployment')),
      apiServices: clusterStore.findAll('apiService')
    };

    if ( get(params, 'id') ) {
      deps['existing'] = store.find('horizontalpodautoscaler', params.id);
    }

    return hash(deps, 'Load dependencies').then((hash) => {
      let hpa;

      let namespaceId = params.namespaceId;
      let namespace;

      if ( namespaceId ) {
        namespace = store.getById('namespace', namespaceId);
      }

      // If the namespace doesn't exist or isn't set, pick default
      if ( !namespace ) {
        namespace = store.all('namespace').findBy('isDefault', true);
        if ( namespace ) {
          namespaceId = get(namespace, 'id');
        }
      }

      if ( hash.existing ) {
        hpa = hash.existing.cloneForNew();
        delete hash.existing;
      } else {
        hpa = store.createRecord({
          type:        'horizontalpodautoscaler',
          namespaceId,
          minReplicas: 1,
          maxReplicas: 10,
          metrics:     [],
        });
      }

      hash.hpa = hpa;

      return hash;
    });
  },

  resetController(controller, isExisting/* , transition*/) {
    if (isExisting) {
      set(controller, 'namespaceId', null);
      set(controller, 'id', null);
    }
  },
});
