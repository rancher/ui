import { inject as service } from '@ember/service';
import { get, observer } from '@ember/object';
import Helper from '@ember/component/helper';

export default Helper.extend({
  intl: service(),

  compute(params) {
    const key = params[0];
    const fallback = params[1];

    const intl = get(this, 'intl');

    if ( key && intl.locale && intl.exists(key) ) {
      return intl.t(key);
    } else if ( key && !fallback ) {
      return key;
    } else {
      return fallback;
    }
  },

  onRecompute: observer('intl.locale', function() {
    this.recompute()
  }),
});
