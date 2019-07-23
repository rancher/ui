import { hash } from 'rsvp';
import { setProperties, get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const store = get(this, 'store');

    const deps = {};

    if ( get(params, 'id') ) {
      deps['existing'] = store.find('destinationrule', params.id);
    }

    return hash(deps, 'Load dependencies').then((hash) => {
      let destinationRule;

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
        destinationRule = hash.existing.cloneForNew();
        delete hash.existing;
      } else {
        destinationRule = store.createRecord({
          type:        'destinationrule',
          namespaceId,
          subsets:     [],
        });
      }

      hash.destinationRule = destinationRule;

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
