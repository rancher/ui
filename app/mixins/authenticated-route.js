import Ember from "ember";

export default Ember.Mixin.create({
  beforeModel: function(transition) {
    this._super(transition);
    var isLoggedIn = (this.get('session.isLoggedIn') === '1') && this.get('session.token');
    if ( this.get('app.authenticationEnabled') && !isLoggedIn )
    {
      transition.send('logout',transition,true);
      return Ember.RSVP.reject('Not logged in');
    }
  }
});
