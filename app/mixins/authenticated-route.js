import Ember from "ember";
import C from 'ui/utils/constants';
import Cookie from 'ui/utils/cookie';

export default Ember.Mixin.create({
  beforeModel: function(transition) {
    this._super.apply(this,arguments);
    var session = this.get('session');
    var isLoggedIn = (session.get(C.SESSION.LOGGED_IN) === true) && Cookie.get(C.HEADER.AUTH_TYPE);
    if ( this.get('app.authenticationEnabled') && !isLoggedIn )
    {
      transition.send('logout', transition, isLoggedIn);
      return Ember.RSVP.reject('Not logged in');
    }
  }
});
