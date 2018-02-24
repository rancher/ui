import { hash } from 'rsvp';
import { set } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params/*, transition*/) {
    const store = this.get('store');

    const deps = {};
    if ( params.dnsRecordId )
    {
      deps['existing'] = store.find('dnsRecordId', params.dnsRecordId);
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

      if ( hash.existing ) {
        record = hash.existing.cloneForNew();
      }
      else {
        record = store.createRecord({
          type: 'dnsRecord',
          namespaceId: namespaceId,
        });
      }

      return {
        record: record,
      };
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting) {
      set(controller, 'namespaceId', null);
      set(controller, 'dnsRecordId', null);
    }
  },
});
