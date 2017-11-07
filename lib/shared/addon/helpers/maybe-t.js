import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';

export default Helper.extend({
  intl: service(),

  compute(params) {
    let key = params[0];
    let fallback = params[1];

    if ( key ) {
      return this.get('intl').t(key);
    } else {
      return fallback;
    }
  }
});
