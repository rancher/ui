import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  cookies: Ember.inject.service(),

  defaultPageSize: -1,
  removeAfterDelete: false,

  headers: function() {
    let out = {
      [C.HEADER.ACTIONS]: C.HEADER.ACTIONS_VALUE,
      [C.HEADER.NO_CHALLENGE]: C.HEADER.NO_CHALLENGE_VALUE
    };

    let csrf = this.get(`cookies.${C.COOKIE.CSRF}`);
    if ( csrf ) {
      out[C.HEADER.CSRF] = csrf;
    }

    return out;
  }.property().volatile(),
});
