import { hash } from 'rsvp';
import { setProperties, get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const store = get(this, 'store');

    const deps = { gateways: store.find('gateway') };

    if ( get(params, 'id') ) {
      deps['existing'] = store.find('virtualservice', params.id);
    }

    return hash(deps, 'Load dependencies').then((hash) => {
      let virtualService;

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
        virtualService = hash.existing.cloneForNew();
        delete hash.existing;
      } else {
        virtualService = store.createRecord({
          type:     'virtualservice',
          namespaceId,
          http:     [],
          gateways: [],
          hosts:    [],
        });
      }

      hash.virtualService = virtualService;

      return hash;
    });
  },

  resetController(controller, isExisting) {
    if (isExisting) {
      setProperties(controller, {
        namespaceId: null,
        id:          null,
      })
    }
  },
});
