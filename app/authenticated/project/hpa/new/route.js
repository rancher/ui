import { hash } from 'rsvp';
import { set, get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const store = get(this, 'store');

    const deps = { deployments: store.findAll('deployment') };

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
