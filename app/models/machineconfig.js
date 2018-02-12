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

  configName: computed(function() {
    const keys = this.allKeys().filter((x) => x.endsWtih('Config'));
    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( get(this,key) ) {
        return key;
      }
    }

    return null;
  }),
});
