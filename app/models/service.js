import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Resource.extend({
  intl: service(),

  displayKind: computed('intl.locale', 'kind', function() {
    const intl = get(this, 'intl');

    if ( get(this, 'kind') === 'LoadBalancer' ) {
      return intl.t('model.service.displayKind.loadBalancer');
    } else {
      return intl.t('model.service.displayKind.generic');
    }
  }),
});
