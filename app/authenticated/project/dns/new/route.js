import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var deps = {};
    if ( params.serviceId )
    {
      deps['service'] = store.find('service', params.serviceId);
    }

    return hash(deps, 'Load dependencies').then(function(hash) {
      let record;

      let namespaceId = params.namespaceId;
      let namespace;
      if ( namespaceId ) {
        namespace = store.getById('namespace', namespaceId);
      }

      // If the namespace doesn't exist or isn't set, pick default
      if ( !namespace ) {
        namespace = store.all('namespace').findBy('isDefault',true);
        if ( namespace ) {
          namespaceId = namespace.get('id');
        }
      }

      if ( hash.existing )
      {
        record = hash.existing.cloneForNew();
      }
      else
      {
        record = store.createRecord({
          type: 'service',
          name: '',
          namespaceId: namespaceId,
        });
      }

      return {
        record: record,
      };
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('namespaceId', null);
      controller.set('serviceId', null);
    }
  },
});
