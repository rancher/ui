import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';

export default Resource.extend({
  state: computed('expired', function() {
    if ( get(this, 'expired') ) {
      return 'expired';
    }

    return 'active';
  }),
});
