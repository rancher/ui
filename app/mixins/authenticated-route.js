import Ember from "ember";
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  cookies: Ember.inject.service(),

  beforeModel: function(transition) {
    this._super.apply(this,arguments);
    var isLoggedIn = !!this.get('cookies').get(C.COOKIE.TOKEN);
    if ( this.get('app.authenticationEnabled') && !isLoggedIn )
    {
      transition.send('logout', transition, isLoggedIn);
      return Ember.RSVP.reject('Not logged in');
    }
  }
});
