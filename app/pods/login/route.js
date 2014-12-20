import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    if ( !this.get('app.authenticationEnabled') )
    {
      this.transitionTo('index');
    }
  }
});
