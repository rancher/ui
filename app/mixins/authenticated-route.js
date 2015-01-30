import Ember from "ember";
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  beforeModel: function(transition) {
    this._super.apply(this,arguments);
    var session = this.get('session');
    var isLoggedIn = (session.get(C.LOGGED_IN) === true) && session.get('jwt');
    if ( this.get('app.authenticationEnabled') && !isLoggedIn )
    {
      transition.send('logout', transition, isLoggedIn);
      return Ember.RSVP.reject('Not logged in');
    }
  }
});
