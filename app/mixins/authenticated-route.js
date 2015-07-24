import Ember from "ember";
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  access: Ember.inject.service(),

  beforeModel: function(transition) {
    this._super.apply(this,arguments);
    if ( this.get('access.enabled') && !this.get('access.isLoggedIn') )
    {
      transition.send('logout', transition, false);
      return Ember.RSVP.reject('Not logged in');
    }
  }
});
