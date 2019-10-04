import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import C from 'ui/utils/constants';
import { computed } from '@ember/object';

export default Mixin.create({
  cookies: service(),

  defaultPageSize:   -1,
  removeAfterDelete: false,

  headers: computed(function() {
    let out = {
      [C.HEADER.ACTIONS]:      C.HEADER.ACTIONS_VALUE,
      [C.HEADER.NO_CHALLENGE]: C.HEADER.NO_CHALLENGE_VALUE
    };

    let csrf = this.get(`cookies.${ C.COOKIE.CSRF }`);

    if ( csrf ) {
      out[C.HEADER.CSRF] = csrf;
    }

    return out;
  }).volatile(),
});
