import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';

export default Resource.extend({
  type: 'machineconfig',

  displayName: computed('requestedHostname','id', function() {
    let name = get(this,'requestedHostname');
    if ( name ) {
      return name;
    }

    return '('+get(this,'id')+')';
  }),
});
